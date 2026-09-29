# Research briefs

Spawn these in parallel: one per subsystem from the Phase 1 map, plus a history agent and a public-context agent. Scale the number of subsystem agents to the codebase: two or three for a small library, up to six for a very large system. Fill the `{placeholders}`. Each agent must be told the work is **read-only**: no edits, commits, checkouts, or new files inside the target repo.

**Run research agents on the `sonnet` model** (pass `model: "sonnet"` when spawning them; the alias always means the current Sonnet). Research is reading and summarising, which Sonnet does well at a fraction of the cost, and it uses up subscription limits much more slowly. Keep the lead agent on the user's model for verification, scripting and judgment.

## Subsystem brief

```
You are researching {REPO_PATH} (branch {BRANCH}), read-only: do not modify,
commit, or checkout anything. The output feeds an explainer video for {AUDIENCE}
who want to understand the CURRENT system: what happens, where, how, and WHY.
Accuracy matters more than anything: cite file:line for every claim and mark
anything inferred as UNVERIFIED.

Your area: {SUBSYSTEM} — main code in {PATHS}.

How to read (this keeps the research fast and cheap):
- Find before you read: use grep/rg and file listings to locate what matters,
  then read only the relevant line ranges (a function, a class, a config
  block). Don't cat whole files or dump hundreds of lines at once.
- Everything you read stays in your context and is re-read on every later
  step, so large reads make every following step slower and more expensive.
- Aim to finish in about 40 tool calls. If you're past that, write up what
  you have rather than exploring further.
- Take notes into your report file as you go, so nothing is lost if you're
  interrupted.

Answer:
0. The core concepts a user of this part must understand (names as used in
   the docs and code), each explained in two or three plain sentences.
1. The end-to-end flow: what triggers it, every step in order, inputs/outputs,
   with the exact names used in code.
2. Why it is built this way — from code comments, docs, commit messages, and PR
   descriptions (`gh pr list --search "<term>" --state all`, `gh pr view <n>`).
   Quote rationale verbatim where it exists.
3. Every concrete number that governs behaviour: thresholds, limits, timeouts,
   batch sizes, retry counts, model names, prices. Include the constant name.
4. External services and models used here, and why each was chosen.
5. Failure stories: bugs, incidents, and workarounds visible in comments,
   KNOWN_ISSUES files, or fix PRs.
6. A worked example: one concrete input traced through every step.
7. What changed recently, and what is in flight (open PRs) but NOT current.
8. Turning points: what this part replaced, approaches tried and abandoned,
   reverts, and rewrites that shaped today's design. For each: what they
   believed then, what went wrong or changed, what they chose instead, and
   the PR/commit that shows it. Skip incidents that didn't change the design.

Write your report to {OUT_DIR}/{slug}.md in two parts:
1. "## Summary" first, under 800 words: the core concepts, the end-to-end
   flow, the key numbers with their file:line, and the turning points. This
   is the part the video is written from.
2. "## Details" after it, as long as it needs to be, with an ASCII flow
   diagram and everything else, for looking things up later.
Reply with a two-line summary and the path.
```

## History brief

```
Reconstruct the evolution of {REPO_PATH} (read-only) for an explainer video:
eras, big rewrites, features built then removed, architecture pivots, model or
dependency migrations, cost or performance crises.

Keep reads narrow: use --format options, jq and head to pull only what you need
rather than dumping full logs or PR bodies. Aim for about 40 tool calls.

Method: skim `git log --format='%ad %s' --date=short` by month; export
`gh pr list --state all --limit 5000 --json number,title,createdAt,mergedAt,state,additions,deletions`
and analyse it; `gh pr view` the largest and most pivotal PRs (titles with
remove/kill/delete/migrate/rewrite/replace/revert/v2). Look for directories that
exist but are empty — they are usually graveyards.

For every major change, capture the story: what the old approach was, why it
seemed right, what broke or changed, and what replaced it, quoting PR text.

Deliver: a month-by-month timeline with PR numbers; named eras with what the
design was in each and why it changed; a graveyard table (built, killed, why);
fun stats (PRs per month, biggest PR, most-churned directory). Cite PR numbers
and dates for everything; mark guesses UNVERIFIED.

Write your report to {OUT_DIR}/history.md in two parts:
1. "## Summary" first, under 800 words: the core concepts, the end-to-end
   flow, the key numbers with their file:line, and the turning points. This
   is the part the video is written from.
2. "## Details" after it, as long as it needs to be, with an ASCII flow
   diagram and everything else, for looking things up later.
Reply with a two-line summary and the path.
```

## Public-context brief

```
Research everything outside {PROJECT}'s own code ({REPO_URL}) that belongs in
an explainer video about it. Use web search. Find:
1. What it is and who makes it, in one line.
2. Why people care right now: recent releases, news, launches, controversies,
   funding, adoption numbers (stars, users, downloads), with dates.
3. Its rivals or predecessors, and how people compare them (forums, blog
   posts, social media): what makes people choose or switch to it.
4. The maintainers' own explanations: launch posts, talks, docs pages, and
   interviews that explain why it was built and why it works the way it does.
5. Anything else a viewer would want to know that the code can't tell you.
6. Any story that makes a strong opening question for the video.
Every claim needs a source URL and date. Separate facts from opinion. Never
rely on unverifiable rumours. Nothing here overrides what the code shows; if
public claims and the code disagree, say so.

Write to {OUT_DIR}/public-context.md and reply with a short summary and the
three strongest possible opening questions.
```

Use this for the hook and for framing only. Every claim about how the code works still comes from the code.

## After the agents return

- Read the Summary section of every report, not the whole thing. When you need a detail, grep the report's Details section for it instead of reading it all; this keeps your own context small for the rest of the run.
- Note conflicts between reports and resolve them by reading the source yourself.
- Collect every on-screen number into a checklist and verify each one (Phase 3).
- Keep a short list of "surprises" (security issues, dead code, stale docs) to report to the user separately.
