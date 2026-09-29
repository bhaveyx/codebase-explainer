# Making it clear, and making it good to watch

The job is simple to state: after watching, the viewer should be able to explain how this system works and why it's built the way it is. Everything else, including the humour, serves that. These are guidelines, not rules. Use judgment; the best video for a tiny CLI tool looks nothing like the best video for a distributed database.

## Learn from the best explainers

- **ByteByteGo** is the closest to what we make: it says what a system is, then animates a request moving through each component in order, with plain headings. Clarity first.
- **3Blue1Brown** carries one concrete example all the way through and makes the visual *be* the explanation. Its little student characters stay on screen and ask real questions at the moment of confusion.
- **Fireship** goes: what it is, how it works, a glimpse of real code, why it matters. Jokes and memes season the explanation; they never replace it.
- **Kurzgesagt** keeps one clear arc, dense but readable visuals, and warmth without gimmicks.

What they share: the structure follows the thing being explained, and entertainment rides on top of understanding instead of competing with it.

## Structure

A shape that works for most codebases (adapt it freely):

1. **Opening (under 30 s).** Why this is worth ten minutes: what the project is, why people care, and what the viewer will understand by the end. A promise to explain beats a shocking statistic. If the public-context research found a genuinely interesting outside angle (a rivalry, a migration, a big launch), it can frame the opening, as long as the video then delivers the explanation.
2. **The whole machine.** Every major part on one screen and how they connect. This is the map the rest of the video fills in.
3. **One chapter per major part, in the order data or control flows through the system.** Explain what the part is before anything clever: what it does, how it does it, the key numbers, and why it's designed that way.
4. **History where it explains the present.** "It used to work like X; that caused Y; so now it's Z" is one of the most satisfying things a viewer can learn. The "in retrospect" moments, when a team changed its mind, make a video feel personal.
5. **Recap.** The journey in one breath, and the few ideas that keep coming back.

**Chapter names are plain and descriptive:** "The Gateway", "Memory and Skills", "Talking to Model Providers", "Tools and Sandboxing". Never a riddle, a pun, or a buzzword ("The Front Desk", "Forty-Seven Dialects", "The Narrow Waist"). The viewer should know what they're about to learn before the chapter starts. Each chapter should open by saying what the part is and what it's for, then go deeper.

## Coverage comes first

Before writing, list the concepts a user or contributor of this project must understand. The README, docs, and the project's own vocabulary tell you (for an agent framework that might be its identity file, skills, memory, subagents, tools; for a database, storage, indexing, replication). Every one of them gets explained, in proportion to its importance. A fun detail about a minor part never takes the place of a core concept.

If you follow a worked example through the system, carry it to the end and show the result. An example that is dropped halfway leaves the viewer hanging.

## Incidents and anecdotes

A bug, outage, or reversal belongs in the video when it explains the design: it caused a change, and the change is what the viewer is learning about. Tell it as cause and effect in a sentence or two. Anecdotes that are merely amusing, unrelated to how the system works, are trivia; leave them out, however good they are. A video made of trivia is fun for a minute and leaves the viewer knowing nothing.

## Humour

Humour is welcome and makes the video easier to watch, but it isn't a quota. It works best when it comes from the explanation itself: an understatement, a true detail that's funny in context, a well-placed meme template, the companion's reaction. Never mock people. If a joke needs a detour away from the explanation, skip it.

## The companion

The skeptic is a companion who stays on screen, not a voice that pops in and out:

- They're visible throughout (the template keeps them in the corner, reacting), so they feel like someone watching alongside the viewer.
- They speak when a viewer would genuinely be confused or curious, in full natural sentences ("Hang on, if the prompt never changes, how does it learn anything new mid-conversation?"), not three-word interjections.
- Fewer, better questions: a handful per chapter at most, and some chapters need none.
- The narrator delivers the answers and the payoff. The companion can summarise at the end in their own words, once they've got it.

## Visuals

- The visual should explain, not decorate: animate the flow, show the data, show the real line of code.
- Use metaphors when they make an idea click (a bucket filling for batching, a relay race for fallbacks), not as a requirement.
- Every frame should have something worth looking at. If a line has nothing to show, keep the previous visual and add to it rather than cutting to an almost empty screen.
- Text must be readable on a laptop: body text 26 px or larger, labels 20 px or larger, and not too much of it at once.
- Two or three glimpses of real code or real commit messages make the video feel authentic.

## Length

There is no target. The video should be as short as it can be while covering everything the viewer needs, and never so long that it drags. Size it to the material: list the ideas a viewer must leave with, give each what it needs, and cut everything else. A short video people finish beats a thorough one they abandon.

## Voice

Text-to-speech sounds flat unless the script is written for it. Short sentences at important moments, longer ones for calm explanation. `pause` (seconds of silence after a line) helps before a key idea lands; `speed` can vary delivery a little (0.92–1.15). Put the key word at the end of the sentence.

## Fresh-viewer critique

After drafting the script, give it to a subagent (on the `sonnet` model is fine) with this brief, and revise before voicing:

```
You are a smart engineer who has never seen this codebase. Read this video
script as if watching it. Then answer, with line references:
1. Explain in your own words how the system works, part by part. Where you
   can't, the script failed to teach it: say which part.
2. Which core concepts of the project did it skip or rush? (Check the README.)
3. Where did you get confused or lose the thread?
4. Where did you get bored, and which anecdotes felt like trivia rather than
   explanation?
5. Did the chapter names tell you what each chapter was about?
Be blunt. Don't rewrite the script; just critique it.
```
