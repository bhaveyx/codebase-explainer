# Research briefs

Spawn these in parallel — one per subsystem from the Phase 1 map, plus one history agent. Fill the `{placeholders}`. Each agent must be told the work is **read-only**: no edits, commits, checkouts, or new files inside the target repo.

## Subsystem brief

```
You are researching {REPO_PATH} (branch {BRANCH}), read-only: do not modify,
commit, or checkout anything. The output feeds an explainer video for {AUDIENCE}
who want to understand the CURRENT system: what happens, where, how, and WHY.
Accuracy matters more than anything: cite file:line for every claim and mark
anything inferred as UNVERIFIED.

Your area: {SUBSYSTEM} — main code in {PATHS}.

Answer:
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
   reverts, and rewrites. For each: what they believed then, what went wrong
   or changed, what they chose instead, and the PR/commit that shows it.
9. Absurd-but-true moments for the script's humour: reversals, ironies,
   surprising numbers, honest code comments. Quote them exactly.

Write a detailed markdown report ending with "10 key takeaways" and an ASCII
flow diagram to {OUT_DIR}/{slug}.md. Reply with a short summary and the path.
```

## History brief

```
Reconstruct the evolution of {REPO_PATH} (read-only) for an explainer video:
eras, big rewrites, features built then removed, architecture pivots, model or
dependency migrations, cost or performance crises.

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

Write to {OUT_DIR}/history.md and reply with a short summary.
```

## After the agents return

- Read every report in full. Note conflicts between reports and resolve them by reading the source yourself.
- Collect every on-screen number into a checklist and verify each one (Phase 3).
- Keep a short list of "surprises" (security issues, dead code, stale docs) to report to the user separately.
