#!/usr/bin/env bash
# Claude Code status line that also records plan usage, so stats.py can report how much
# of your 5-hour and weekly limits a video took. Runs locally; no model calls.
#
# Setup (in ~/.claude/settings.json):
#   "statusLine": { "type": "command", "command": "<skill>/tools/usage-statusline.sh" }
#
# Each update appends one line to ~/.claude/codebase-explainer/usage-log.jsonl, but only
# when the percentages change, so the log stays small.
python3 -c '
import json, os, sys, time
d = json.load(sys.stdin)
rl = d.get("rate_limits") or {}
five, week = rl.get("five_hour") or {}, rl.get("seven_day") or {}
row = {"session_id": d.get("session_id"), "five_hour": five.get("used_percentage"), "seven_day": week.get("used_percentage"),
       "five_hour_resets_at": five.get("resets_at"), "seven_day_resets_at": week.get("resets_at")}
if row["seven_day"] is not None or row["five_hour"] is not None:
    log = os.path.expanduser("~/.claude/codebase-explainer/usage-log.jsonl")
    os.makedirs(os.path.dirname(log), exist_ok=True)
    state = log + ".last"
    key = json.dumps(row, sort_keys=True)
    if not os.path.exists(state) or open(state).read() != key:
        with open(log, "a") as f:
            f.write(json.dumps({"ts": time.time(), **row}) + "\n")
        open(state, "w").write(key)
model = (d.get("model") or {}).get("display_name", "")
parts = [model] if model else []
five_pct, week_pct = row["five_hour"], row["seven_day"]
if five_pct is not None:
    parts.append(f"5h {five_pct:.0f}%")
if week_pct is not None:
    parts.append(f"week {week_pct:.0f}%")
print(" · ".join(parts))
'
