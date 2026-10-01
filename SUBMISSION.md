---
title: Item Review Desk: exam questions that can't go live until a second person signs them off
published: true
tags: devchallenge, sanitychallenge, sanity, ai
---

*This is a submission for the [Sanity Challenge, Path Two: Vibe-Code Something Strange](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

I run a training school in Lagos and have spent years writing exam questions and certification prep for working professionals, a lot of it for customer service and contact centre roles. The part of that job nobody sees is item review. A question gets drafted, a subject expert checks it, it goes back for changes, it gets approved, and years later it gets retired because the process it tests has changed. In most teams that trail lives in email threads and a spreadsheet column called "status".

Item Review Desk puts that process into Sanity as data. Each exam item carries its own state and a log of every move: who moved it, from where to where, when, and why. An AI agent can draft items and submit them for review. Only a person can approve, and the person who wrote an item cannot approve it. A Next.js site builds a practice bank from approved items only, and a board shows how far each exam blueprint is from its target.

The sample content is a real-shaped exam: Contact Centre Associate, Level 1, with four learning objectives and twelve items sitting in every state (approved, in review, changes requested, draft).

## Demo

- Live site: https://item-review-desk.vercel.app
- Practice bank: https://item-review-desk.vercel.app/practice/contact-centre-associate-1
- Blueprint board: https://item-review-desk.vercel.app/board
- Studio: https://item-review-desk.vercel.app/studio (needs a login to the Sanity project)

![Home page](https://raw.githubusercontent.com/drainocode/item-review-desk/main/shots/home.png)

![Practice bank built only from approved items](https://raw.githubusercontent.com/drainocode/item-review-desk/main/shots/practice.png)

![Blueprint board with recent workflow moves](https://raw.githubusercontent.com/drainocode/item-review-desk/main/shots/board.png)

## Code

https://github.com/drainocode/item-review-desk

## My Build Process

Honest version first: I didn't type this code. I use an AI agent (Claude) that looks for challenges I can enter and builds the entries, based on my background. This one it built end to end in one session from a brief rooted in how I run item reviews. My part was the domain, reviewing the result, setting up the Sanity project and publishing. So this writeup covers what the agent did and where it went wrong, taken from the session.

**Stack.** Next.js 16, Sanity 6 with the Studio embedded at `/studio` through next-sanity, groq-js for an offline mode, and plain Node test runner for the rules.

**The main design choice: one rules file for people and agents.** `lib/workflow.ts` defines the states and transitions and who may fire each one:

| Move | From | Allowed | Extra rule |
| --- | --- | --- | --- |
| Submit for review | draft, changes requested | human, agent | no item-writing errors |
| Request changes | in review | human | note required |
| Approve | in review | human | no errors, approver is not the author |
| Retire | approved | human | note required |
| Reopen | retired, approved | human | note required |

The Studio document actions and the drafting agent script both call the same `check()` and `buildPatch()` functions, so an agent literally has no code path to "approved". The plain Publish button is removed for items; the only way an item reaches the practice site is through a logged transition.

**Item-writing checks as a custom input.** `lib/lint.ts` encodes the rules I'd give a new item writer: one clear problem in the stem, negatives like NOT and EXCEPT in capitals, three to five options, exactly one key, no "all of the above", a rationale, a linked objective. It also warns when the correct option is much longer than the distractors (candidates learn to pick the longest answer) and when only the key repeats words from the stem. The checks show live inside the item form and errors disable Submit and Approve.

**Where it went wrong and how it was fixed:**

1. *The sandbox couldn't reach Sanity.* The agent's environment blocked the Sanity API host, so the first `next build` failed while prerendering the home page (HTTP 403, host not in allowlist). Rather than skip verification, it added an `OFFLINE_SEED=1` mode that runs the exact same GROQ queries against `seed.ndjson` using groq-js. That let it build, run and screenshot the site, and it doubles as a way for anyone to preview the project without an account.
2. *The negative-word rule was too blunt.* The first version flagged any lowercase "not" in the stem, so it complained about a scenario that said a customer was swearing "at the product, not at the agent". Only the sentence that asks the question matters, so the rule now looks at that sentence alone. There's a test for both cases.
3. *The longest-answer warning caught the agent's own questions.* When it linted its seed items, 7 of 11 finished items tripped the "key much longer than distractors" warning. The warning was right: the correct answers were noticeably more detailed than the wrong ones, which is exactly the flaw it's meant to catch. It rewrote the distractors to be as specific as the keys for the approved items. It left the warning on the two items the agent submitted for review, because that's the realistic case a reviewer should see.
4. *The first live test failed quietly.* The agent couldn't click through the Studio against a real project, so I did that after loading the sample exam. I approved the delivery question and requested changes on the third-party caller question. The dialogs worked and logged my name, but both items stayed as unpublished drafts and the practice site still showed 8 questions instead of 9. The cause: each action patched the draft and then called `publish` in the same instant, and at that instant the Studio still thought there was nothing to publish, so it skipped it. The fix writes the transition straight to the published document in one transaction and removes the draft. I discarded the stuck drafts, ran both actions again, and the approved item went live with the move logged on the board.
5. *Loading the sample data without the Sanity CLI.* I'm not a developer and didn't want to install tooling locally, so the seed import runs as a one-click GitHub Action that sends `seed.ndjson` to the dataset over the HTTP API.

**What I'd do next:** move the agent from a script to Sanity Functions so it drafts items when an objective falls below its blueprint target, and add a second reviewer step for high-stakes exams.

## Sanity Project Details

- Project ID: `x97jsgh6`
- Dataset: `production`
- Types: `exam` (with blueprint rows), `objective`, `item` (options with "why a candidate might pick this", rationale, cognitive level, state, transition log)
