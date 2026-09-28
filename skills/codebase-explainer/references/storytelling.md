# Storytelling

Accuracy makes a video trustworthy. Story makes people finish it. Apply these rules while scripting (Phase 4) and storyboarding (Phase 5).

## 1. A mystery that pays off

- The first 15 seconds pose one question the whole video answers. Good questions are surprising and specific: "Why does this project ship a command to migrate *away* from its biggest rival?", "How does a 600-line file train a GPT?", "Why did they delete the database?"
- State it plainly, then promise the answer: "By the end, you'll know exactly why."
- Pay it off explicitly near the end, and call back to the opening line.
- The public-context report is the best source of hooks: why people are talking about this project right now, and what it's being compared to. Pick the question a curious outsider would actually ask, then answer it from the code.

## 2. Every chapter is question → tension → answer

- Open a chapter with the problem it solves, not its name. Not "Chapter 3: Memory" but "Chapter 3. How do you make an agent remember you… without it remembering everything?"
- Show what goes wrong without the mechanism (the stakes), then reveal how the code solves it.
- End the chapter on the answer, stated in one sentence the viewer could repeat to a friend.

## 3. A metaphor for every concept

Before reaching for boxes and arrows, find a physical metaphor and storyboard it:

| Concept | Metaphor |
|---|---|
| Buffering / batching | a bucket filling to a line, then tipping |
| Retries / fallbacks | a relay race where a runner hands the baton to a backup |
| Search strategies | detectives each following a different clue |
| Background maintenance | sleep, a janitor's night shift, pruning a garden |
| Rate limits / budgets | a meter running, a fuel gauge |
| Pipelines | an assembly line, a kitchen passing plates |
| Caching | a sticky note on the fridge vs walking to the store |

One strong metaphor per chapter is plenty. Keep it consistent once introduced.

## 4. Pacing

- **Length:** there is no target. The video should be as short as it can be while still covering everything the viewer needs, and never so long that it drags. Size it to the material: list the ideas a viewer must leave with, give each one what it needs, and cut everything else. Before voicing, reread the script and ask of each line: would the viewer miss this? If not, cut it. A short video that people finish beats a thorough one they abandon.
- No single visual composition holds for more than ~40 seconds.
- A **pattern interrupt** every 60–90 seconds: a joke, a stamp, a skeptic reaction, a meme, a surprising true fact, a jump to real code.
- After a dense explanation, a short breather: a one-line recap, a visual gag, or a pause.
- Vary energy between chapters: fast and punchy, then slow and clear.

## 5. Comedy comes from true things

Don't write jokes. Find them. The research already contains them:

- Reversals: a feature renamed twice in one week; a model swapped out and later swapped back in.
- Irony: a "temporary" flag still set two years later; a safety check that caused the outage.
- Scale: absurd numbers (16,000 PRs in one release, a PR that deletes more than it adds).
- Graveyards: things built, celebrated, and deleted.
- Honest code comments ("this is a hack", "don't touch this").

Deliver them deadpan. Understatement beats exclamation marks. Never mock people; laugh at situations.

## 6. The skeptic has an arc

- Starts confused or suspicious ("this sounds overengineered").
- Asks the question the viewer is thinking, at the moment they think it.
- Once per video, catches the narrator out or makes a sharp point the narrator concedes.
- Ends convinced, ideally by repeating the core idea in their own words.
- Running gags: one recurring bit (a catchphrase, a worry that keeps coming back) paid off in the finale.

## 7. Voice direction

Text-to-speech sounds flat unless the script is written for it:

- Short sentences at dramatic moments. Longer ones for calm explanation.
- Use `pause` (seconds of silence after the line) before big reveals and after punchlines: 0.6–1.2 s.
- Use `speed` to vary delivery: 0.92–0.97 for weighty lines, 1.08–1.15 for rapid-fire lists and excited asides.
- Put the key word last in the sentence; that's where emphasis lands naturally.

## 8. Real code moments

Two or three times per video, show the actual thing: the exact line with the magic number, a real commit message, a real diff. Authentic artifacts are more interesting than any diagram, and they prove the video isn't making things up.

## 9. Highlights

Mark 6–10 lines with `"highlight": true`: the hook, the best reveals, the funniest true facts, the payoff. `scripts/social-cut.mjs` stitches them into a 60–90 s cut for social media. Each highlight should make sense on its own, so pick lines whose visuals are self-explanatory. The `--vertical` version letterboxes the 16:9 frame, so highlights read best when their visuals are big and bold.

## 10. "In retrospect": turning points make it personal

The moments viewers remember most are the decisions: "we built it this way, it didn't work, so we switched to that." A system described only as it is today feels like a tour; the same system told through the forks in the road feels like a story about people.

- For each chapter, look in the research for the road not taken: what this part replaced, what was tried and abandoned, what got reverted.
- Tell it as a short arc: what they believed then → what broke or changed → what they chose instead → how today's design still carries that lesson.
- Give the old design its due. It usually made sense at the time; say why, then say what changed.
- When the viewer's own team made the call, speak as "we". For someone else's project, use the maintainers' own words from PR descriptions and commit messages.
- One big turning point can carry a whole chapter (e.g. a rewrite of the core data model). Smaller ones make great 20-second asides.
- Only state a reason if it's written down somewhere. Otherwise say the reason is inferred.

## Fresh-viewer critique

After drafting the script, give it to a subagent with this brief and revise before voicing:

```
You are a smart engineer who has never seen this codebase. Read this video
script as if watching it. Report, with line references:
1. Where you got confused or lost the thread.
2. Where you got bored (and would scroll away).
3. Which jokes or reveals landed, and which fell flat.
4. Whether the opening question was answered clearly at the end.
5. The one thing you'll remember tomorrow. If that isn't the main point,
   say so.
Be blunt. Do not rewrite the script; just critique it.
```
