# /// script
# requires-python = ">=3.10"
# ///
"""Track how a video was made: time per phase, agents, tokens, cost, and output stats.

Zero-cost mode (the default): after the video is done, run this yourself in a normal
terminal, from the video project directory. No agent is involved, so it costs nothing:

  uv run <skill>/tools/stats.py report --session latest --repo <path-to-explained-repo>

`--session` also accepts a transcript path. You get totals (time, agents, tokens, cost,
video and research stats) but no per-phase breakdown. It measures the whole session, so
make the video in a fresh session for the numbers to describe just the video.

Tracked mode (opt-in, `--stats` when invoking the skill): the agent runs these as it
works. Each call is one extra agent turn, so this adds a small cost to the run:

  uv run <skill>/tools/stats.py start --repo <path-to-explained-repo>
  uv run <skill>/tools/stats.py mark <phase>     # map, research, verify, script, critique,
                                                  # moodboard, voice, build, review, render
  uv run <skill>/tools/stats.py note checkin      # count a pause for the user's approval
  uv run <skill>/tools/stats.py report            # writes out/stats.json, out/STATS.md, out/stats-card.json
  npx remotion still src/index.ts StatsCard out/stats-card.png --props=out/stats-card.json

The session is identified by a marker that `start` prints: the marker lands in the
agent's transcript, so `report` can find that exact session (and its subagents) under
~/.claude/projects even when other sessions are running. Token usage comes from those
transcripts; dollar figures are API list prices, which for subscription users is an
"API-equivalent" cost rather than what they were charged.
"""
import json
import re
import secrets
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

STATE = Path("out/stats-state.json")
# USD per million tokens: input, 5m cache write, 1h cache write, cache read, output.
# Match by longest prefix, so "claude-opus-5-5" is checked before "claude-opus-5".
PRICES = {
    "claude-fable-5-1": (10.0, 12.5, 20.0, 0.25, 50.0),
    "claude-mythos-5-1": (10.0, 12.5, 20.0, 0.25, 50.0),
    "claude-fable-5": (10.0, 12.5, 20.0, 1.0, 50.0),
    "claude-mythos-5": (10.0, 12.5, 20.0, 1.0, 50.0),
    "claude-opus-5-5": (4.0, 5.0, 8.0, 0.20, 20.0),
    "claude-opus-5": (5.0, 6.25, 10.0, 0.5, 25.0),
    "claude-opus-4": (5.0, 6.25, 10.0, 0.5, 25.0),
    "claude-sonnet-5": (2.0, 2.5, 4.0, 0.2, 10.0),
    "claude-sonnet-4": (3.0, 3.75, 6.0, 0.3, 15.0),
    "claude-haiku-4": (1.0, 1.25, 2.0, 0.1, 5.0),
}
WEB_SEARCH_USD = 0.01  # $10 per 1,000 searches
PHASES = ["map", "research", "verify", "script", "critique", "moodboard", "voice", "build", "review", "render"]


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def parse_ts(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def load() -> dict:
    if not STATE.exists():
        sys.exit("no stats run in progress here; run `stats.py start` from the video project directory first")
    return json.loads(STATE.read_text())


def save(state: dict) -> None:
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, indent=1))


def price_for(model: str):
    for prefix in sorted(PRICES, key=len, reverse=True):
        if model.startswith(prefix):
            return PRICES[prefix]
    return None


def find_session(marker: str) -> Path | None:
    root = Path.home() / ".claude" / "projects"
    hits = []
    for f in root.glob("*/*.jsonl"):
        try:
            if marker in f.read_text(errors="ignore"):
                hits.append(f)
        except OSError:
            pass
    return max(hits, key=lambda p: p.stat().st_mtime) if hits else None


def usage_from(files: list[Path], since: datetime) -> dict:
    """Sum usage across transcripts, counting each API response once.

    Transcripts write one record per content block, all carrying the same usage,
    so records are deduplicated by (message id, request id).
    """
    seen = set()
    by_model: dict[str, dict] = {}
    tools: dict[str, int] = {}
    web_searches = 0
    for f in files:
        for line in f.read_text(errors="ignore").splitlines():
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            msg = rec.get("message")
            if rec.get("type") != "assistant" or not isinstance(msg, dict) or not msg.get("usage"):
                continue
            ts = rec.get("timestamp")
            if not ts or parse_ts(ts) < since:
                continue
            key = (msg.get("id"), rec.get("requestId"))
            if key in seen:
                for block in msg.get("content") or []:
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        tools[block.get("name", "?")] = tools.get(block.get("name", "?"), 0) + 1
                continue
            seen.add(key)
            for block in msg.get("content") or []:
                if isinstance(block, dict) and block.get("type") == "tool_use":
                    tools[block.get("name", "?")] = tools.get(block.get("name", "?"), 0) + 1
            u = msg["usage"]
            model = msg.get("model") or "unknown"
            if model.startswith("<"):
                continue
            m = by_model.setdefault(model, {"input": 0, "cache_write_5m": 0, "cache_write_1h": 0, "cache_read": 0, "output": 0, "requests": 0})
            cc = u.get("cache_creation") or {}
            w1h = cc.get("ephemeral_1h_input_tokens", 0)
            w5m = cc.get("ephemeral_5m_input_tokens", u.get("cache_creation_input_tokens", 0) - w1h)
            m["input"] += u.get("input_tokens", 0)
            m["cache_write_5m"] += w5m
            m["cache_write_1h"] += w1h
            m["cache_read"] += u.get("cache_read_input_tokens", 0)
            m["output"] += u.get("output_tokens", 0)
            m["requests"] += 1
            web_searches += (u.get("server_tool_use") or {}).get("web_search_requests", 0)
    total_cost = 0.0
    priced = True
    for model, m in by_model.items():
        p = price_for(model)
        if p is None:
            m["cost_usd"] = None
            priced = False
            continue
        cost = (m["input"] * p[0] + m["cache_write_5m"] * p[1] + m["cache_write_1h"] * p[2] + m["cache_read"] * p[3] + m["output"] * p[4]) / 1e6
        m["cost_usd"] = round(cost, 2)
        total_cost += cost
    total_cost += web_searches * WEB_SEARCH_USD
    tokens = sum(m["input"] + m["cache_write_5m"] + m["cache_write_1h"] + m["cache_read"] + m["output"] for m in by_model.values())
    return {
        "by_model": by_model,
        "total_tokens": tokens,
        "output_tokens": sum(m["output"] for m in by_model.values()),
        # Claude Code's WebSearch/WebFetch are client tool calls, not API server tools.
        "web_searches": web_searches + tools.get("WebSearch", 0),
        "web_fetches": tools.get("WebFetch", 0),
        "tool_calls": dict(sorted(tools.items(), key=lambda kv: -kv[1])),
        "cost_usd": round(total_cost, 2),
        "cost_complete": priced,
    }


USAGE_LOG = Path.home() / ".claude" / "codebase-explainer" / "usage-log.jsonl"


def plan_usage(session_id: str | None, since: datetime, until: datetime) -> dict:
    """Weekly and 5-hour plan usage before and after, from tools/usage-statusline.sh's log.

    The percentages are account-wide, so anything else using the same account during the
    run (other sessions, claude.ai) is included in the delta.
    """
    if not USAGE_LOG.exists():
        return {}
    rows = []
    for line in USAGE_LOG.read_text(errors="ignore").splitlines():
        try:
            r = json.loads(line)
        except json.JSONDecodeError:
            continue
        ts = datetime.fromtimestamp(r["ts"], tz=timezone.utc)
        if since <= ts <= until and (session_id is None or r.get("session_id") in (None, session_id)):
            rows.append(r)
    if not rows:
        return {}
    out = {}
    for key in ("seven_day", "five_hour"):
        vals = [r for r in rows if r.get(key) is not None]
        if not vals:
            continue
        first, last = vals[0], vals[-1]
        entry = {"before": first[key], "after": last[key], "delta": round(last[key] - first[key], 1)}
        if first.get(f"{key}_resets_at") != last.get(f"{key}_resets_at"):
            entry["window_reset_during_run"] = True
        out[key] = entry
    return out


def sh(cmd: list[str], cwd: str | None = None) -> str:
    try:
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""


def duration(path: Path) -> float | None:
    out = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)])
    return round(float(out), 1) if out else None


def fmt_dur(seconds: float) -> str:
    s = int(round(seconds))
    h, rem = divmod(s, 3600)
    m, s = divmod(rem, 60)
    if h:
        return f"{h}h {m:02d}m"
    return f"{m}m {s:02d}s" if m else f"{s}s"


def repo_stats(repo: str | None) -> dict:
    if not repo or not Path(repo).exists():
        return {}
    files = sh(["git", "ls-files"], cwd=repo).splitlines()
    code_ext = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", ".kt", ".rb", ".swift", ".c", ".cc", ".cpp", ".h", ".cs", ".php", ".scala", ".sql", ".sh", ".mjs", ".vue", ".svelte"}
    loc = 0
    for f in files:
        p = Path(repo) / f
        if p.suffix in code_ext and p.is_file():
            try:
                loc += sum(1 for _ in p.open(errors="ignore"))
            except OSError:
                pass
    commits = sh(["git", "rev-list", "--count", "HEAD"], cwd=repo)
    return {"files": len(files), "lines_of_code": loc, "commits": int(commits) if commits.isdigit() else None,
            "head": sh(["git", "rev-parse", "--short", "HEAD"], cwd=repo)}


def research_stats() -> dict:
    reports = sorted(Path("research").glob("*.md")) if Path("research").exists() else []
    text = "\n".join(p.read_text(errors="ignore") for p in reports)
    citations = re.findall(r"[\w./-]+\.[A-Za-z]{1,5}:\d+", text)
    prs = set(re.findall(r"(?<![\w&])#(\d{2,6})\b", text))
    return {"reports": len(reports), "words": len(text.split()), "citations": len(citations),
            "unique_files_cited": len({c.rsplit(':', 1)[0] for c in citations}), "prs_referenced": len(prs),
            "unverified_flags": text.count("UNVERIFIED")}


def script_stats() -> dict:
    if not Path("script.json").exists():
        return {}
    script = json.loads(Path("script.json").read_text())
    lines = [l for sc in script for l in sc["lines"]]
    return {"scenes": len(script), "chapters": sum(1 for sc in script if sc.get("chapter")), "lines": len(lines),
            "words": sum(len(l["text"].split()) for l in lines), "skeptic_lines": sum(1 for l in lines if l["who"] == "S")}


def cmd_start(args: list[str]) -> None:
    repo = args[args.index("--repo") + 1] if "--repo" in args else None
    marker = f"codebase-explainer-stats-{secrets.token_hex(6)}"
    save({"marker": marker, "started_at": now(), "repo": str(Path(repo).resolve()) if repo else None, "marks": [], "notes": {}})
    print(f"stats started: {marker}")


def cmd_mark(args: list[str]) -> None:
    state = load()
    phase = args[0] if args else sys.exit(f"usage: stats.py mark <phase>  (phases: {', '.join(PHASES)})")
    state["marks"].append({"phase": phase, "at": now()})
    save(state)
    print(f"marked {phase}")


def cmd_note(args: list[str]) -> None:
    state = load()
    key = args[0] if args else sys.exit("usage: stats.py note <key>")
    state["notes"][key] = state["notes"].get(key, 0) + 1
    save(state)
    print(f"{key}: {state['notes'][key]}")


def latest_session() -> Path | None:
    files = list((Path.home() / ".claude" / "projects").glob("*/*.jsonl"))
    return max(files, key=lambda p: p.stat().st_mtime) if files else None


def first_last_timestamps(path: Path) -> tuple[datetime | None, datetime | None]:
    first = last = None
    for line in path.read_text(errors="ignore").splitlines():
        try:
            ts = json.loads(line).get("timestamp")
        except (json.JSONDecodeError, AttributeError):
            continue
        if ts:
            first = first or parse_ts(ts)
            last = parse_ts(ts)
    return first, last


def cmd_report(args: list[str]) -> None:
    opt = lambda name: args[args.index(name) + 1] if name in args else None
    if opt("--session"):
        # Zero-cost mode: no tracker state; derive everything from the transcript.
        chosen = opt("--session")
        session = latest_session() if chosen == "latest" else Path(chosen).expanduser()
        if not session or not session.exists():
            sys.exit("no session transcript found under ~/.claude/projects")
        first, last = first_last_timestamps(session)
        repo = opt("--repo")
        state = {"started_at": (first or datetime.now(timezone.utc)).isoformat(), "marks": [], "notes": {},
                 "repo": str(Path(repo).resolve()) if repo else None}
        started = parse_ts(state["started_at"])
        finished = last or datetime.now(timezone.utc)
        print(f"using transcript {session}")
    else:
        state = load()
        started = parse_ts(state["started_at"])
        finished = datetime.now(timezone.utc)
        session = find_session(state["marker"])
    files: list[Path] = []
    subagents = 0
    if session:
        files.append(session)
        sub_dir = session.with_suffix("") / "subagents"
        for f in sub_dir.glob("*.jsonl") if sub_dir.exists() else []:
            first = f.open(errors="ignore").readline()
            try:
                ts = json.loads(first).get("timestamp")
            except json.JSONDecodeError:
                ts = None
            if ts is None or parse_ts(ts) >= started:
                files.append(f)
                subagents += 1
    usage = usage_from(files, started) if files else {}

    marks = state["marks"]
    phases = []
    for i, m in enumerate(marks):
        end = parse_ts(marks[i + 1]["at"]) if i + 1 < len(marks) else finished
        phases.append({"phase": m["phase"], "seconds": round((end - parse_ts(m["at"])).total_seconds())})

    videos = {}
    for p in sorted(Path("out").glob("*.mp4")):
        if not p.name.endswith("-raw.mp4"):
            videos[p.name] = duration(p)
    main = next(iter(videos.values()), None)

    stats = {
        "started_at": state["started_at"],
        "finished_at": finished.isoformat(),
        "wall_clock_seconds": round((finished - started).total_seconds()),
        "phases": phases,
        "user_checkins": state["notes"].get("checkin", 0),
        "notes": state["notes"],
        "session_transcript": str(session) if session else None,
        "subagents": subagents,
        "usage": usage,
        "videos_seconds": videos,
        "script": script_stats(),
        "research": research_stats(),
        "repo": repo_stats(state.get("repo")),
    }
    stats["plan_usage"] = plan_usage(session.stem if session else None, started, finished)
    if main and usage.get("cost_usd"):
        stats["cost_per_video_minute_usd"] = round(usage["cost_usd"] / (main / 60), 2)
    Path("out/stats.json").write_text(json.dumps(stats, indent=1))

    r, s, rs, u = stats["repo"], stats["script"], stats["research"], usage
    lines = ["# How this video was made", ""]
    if main:
        lines.append(f"- **Video:** {fmt_dur(main)} long, {s.get('chapters', 0)} chapters, {s.get('words', 0):,} words of script")
    lines.append(f"- **Time to make:** {fmt_dur(stats['wall_clock_seconds'])} start to finish, with {stats['user_checkins']} check-ins from a human")
    if r:
        lines.append(f"- **Codebase:** {r.get('lines_of_code', 0):,} lines of code in {r.get('files', 0):,} files, {r.get('commits') or 0:,} commits (at {r.get('head')})")
    if rs.get("reports"):
        lines.append(f"- **Research:** {rs['reports']} reports, {rs['citations']:,} file:line citations across {rs['unique_files_cited']:,} files, {rs['prs_referenced']:,} PRs referenced")
    lines.append(f"- **Agents:** 1 lead agent + {subagents} subagents")
    if u:
        cost = f"${u['cost_usd']:,.2f}" + ("" if u["cost_complete"] else " (some models unpriced)")
        lines.append(f"- **Tokens:** {u['total_tokens']:,} total ({u['output_tokens']:,} generated); {u['web_searches']} web searches, {u['web_fetches']} page fetches")
        pu = stats["plan_usage"]
        if pu.get("seven_day"):
            w = pu["seven_day"]
            note = " (the weekly window reset during the run, so this delta is not meaningful)" if w.get("window_reset_during_run") else ""
            lines.append(f"- **Weekly plan usage:** {w['delta']:+.1f} points ({w['before']:.0f}% → {w['after']:.0f}%){note}")
        if pu.get("five_hour") and not pu["five_hour"].get("window_reset_during_run"):
            f5 = pu["five_hour"]
            lines.append(f"- **5-hour plan usage:** {f5['delta']:+.1f} points ({f5['before']:.0f}% → {f5['after']:.0f}%)")
        lines.append(f"- **Cost:** {cost} at API list prices (what the same work would cost via the API; subscriptions are billed by plan instead)" + (f", about ${stats['cost_per_video_minute_usd']:,.2f} per minute of video" if "cost_per_video_minute_usd" in stats else ""))
    if phases:
        lines += ["", "| Phase | Time |", "|---|---|"] + [f"| {p['phase']} | {fmt_dur(p['seconds'])} |" for p in phases]
    if u.get("by_model"):
        lines += ["", "| Model | Requests | Input | Cache write | Cache read | Output | API-price cost |", "|---|---|---|---|---|---|---|"]
        totals = {"requests": 0, "input": 0, "write": 0, "cache_read": 0, "output": 0}
        for model, m in sorted(u["by_model"].items(), key=lambda kv: -(kv[1]["cost_usd"] or 0)):
            write = m["cache_write_5m"] + m["cache_write_1h"]
            for k, v in (("requests", m["requests"]), ("input", m["input"]), ("write", write), ("cache_read", m["cache_read"]), ("output", m["output"])):
                totals[k] += v
            cost = f"${m['cost_usd']:,.2f}" if m["cost_usd"] is not None else "unpriced"
            lines.append(f"| {model} | {m['requests']:,} | {m['input']:,} | {write:,} | {m['cache_read']:,} | {m['output']:,} | {cost} |")
        lines.append(f"| **total** | {totals['requests']:,} | {totals['input']:,} | {totals['write']:,} | {totals['cache_read']:,} | {totals['output']:,} | ${u['cost_usd']:,.2f} |")
    if not session:
        lines += ["", "_Token and cost data unavailable: the session transcript wasn't found under ~/.claude/projects._"]
    else:
        lines += ["", "_Tokens and cost are read from Claude Code's session transcripts, whose format is internal and can change. Cross-check with `/usage` in the same session._"]
    Path("out/STATS.md").write_text("\n".join(lines) + "\n")

    card = []
    card.append({"label": "to make", "value": fmt_dur(stats["wall_clock_seconds"])})
    if main:
        card.append({"label": "video length", "value": fmt_dur(main)})
    if r.get("lines_of_code"):
        card.append({"label": "lines of code", "value": f"{r['lines_of_code'] / 1000:,.0f}k" if r["lines_of_code"] >= 10000 else f"{r['lines_of_code']:,}"})
    card.append({"label": "AI agents", "value": str(1 + subagents)})
    if rs.get("citations"):
        card.append({"label": "source citations", "value": f"{rs['citations']:,}"})
    week = stats["plan_usage"].get("seven_day")
    if week and not week.get("window_reset_during_run"):
        card.append({"label": "of a weekly plan limit", "value": f"{week['delta']:.0f}%"})
    if u.get("cost_usd"):
        card.append({"label": "API cost", "value": f"${u['cost_usd']:,.0f}" if u["cost_usd"] >= 10 else f"${u['cost_usd']:,.2f}"})
    repo_name = Path(state["repo"]).name if state.get("repo") else "a codebase"
    Path("out/stats-card.json").write_text(json.dumps({
        "title": "How this video was made",
        "subtitle": f"{repo_name}, explained by coding agents",
        "stats": card[:6],
        "footer": "npx skills add bhaveyx/codebase-explainer",
    }, indent=1))
    print("\n".join(lines))


if __name__ == "__main__":
    commands = {"start": cmd_start, "mark": cmd_mark, "note": cmd_note, "report": cmd_report}
    if len(sys.argv) < 2 or sys.argv[1] not in commands:
        sys.exit(f"usage: stats.py {{{'|'.join(commands)}}} ...")
    commands[sys.argv[1]](sys.argv[2:])
