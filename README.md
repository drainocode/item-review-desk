# Item Review Desk

Certification exam items (multiple choice questions) that move from draft to live through a logged review workflow in Sanity. An agent can draft items and submit them for review; only a person can approve them, and nobody can approve an item they wrote. A Next.js site serves a practice bank built only from approved items, and a board shows how each exam blueprint is filling up.

## What is in here

| Path | What it does |
| --- | --- |
| `lib/workflow.ts` | States, transitions and rules (who may fire each move, notes required, lint must be clean, author cannot approve). Shared by the Studio and the agent. |
| `lib/lint.ts` | Item-writing checks: stem length, capitalised negatives in the question, 3 to 5 options, exactly one key, duplicates, "all of the above", a key much longer than the distractors, a clang cue, rationale, objective, cognitive level. |
| `sanity/schemaTypes` | `exam` (with a blueprint), `objective`, `item` (options with "why a candidate might pick this", rationale, state, transition log). |
| `sanity/actions/workflowActions.tsx` | Studio document actions: Submit for review, Request changes, Approve, Retire, Reopen. Each writes a log entry and publishes. The plain Publish button is removed for items. |
| `sanity/components/ItemChecksInput.tsx` | Live item-writing checks inside the item form. |
| `sanity/structure.ts` | Review queue grouped by state. |
| `scripts/agent-draft.ts` | Drafting agent: takes proposed items as JSON, lints them, creates drafts and submits the clean ones for review. It cannot approve. |
| `app/` | Home, `/practice/[slug]` quiz with rationales, `/board` blueprint coverage and recent moves, `/studio` embedded Studio. |
| `data/seed.ts`, `seed.ndjson` | Sample exam: Contact Centre Associate, Level 1, 4 objectives, 12 items in every state. |

## Run it

```bash
npm install
cp .env.example .env.local        # add your project ID
npx sanity dataset import seed.ndjson production
npm run dev                       # site on :3000, Studio on /studio
```

In sanity.io/manage > API > CORS origins, add `http://localhost:3000` and your deployed URL with credentials allowed.

Preview without a Sanity project (runs the same GROQ against `seed.ndjson` with groq-js):

```bash
OFFLINE_SEED=1 npm run build && OFFLINE_SEED=1 npm start
```

Agent (dry run prints what it would do; add `SANITY_WRITE_TOKEN` to write):

```bash
npm run agent:draft -- data/proposals.example.json
```

Tests: `npm test` (workflow and lint rules).

## Loading the sample content without the Sanity CLI

Add two repository secrets, `SANITY_PROJECT_ID` and `SANITY_WRITE_TOKEN` (an Editor token), then run the **Import sample content into Sanity** workflow from the Actions tab. It sends `seed.ndjson` to your dataset with `scripts/import-seed.mjs`.
