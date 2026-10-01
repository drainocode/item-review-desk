// Drafting agent. Takes items proposed by any LLM (or a person) as JSON,
// runs the same item-writing checks the Studio shows, writes each item as a
// draft, and submits the clean ones for review through the shared workflow.
// It has no path to "approved": lib/workflow.ts reserves that for humans.
//
// Usage:
//   SANITY_WRITE_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... \
//   node --experimental-strip-types scripts/agent-draft.ts proposals.json
import {readFileSync} from 'node:fs'
import {createClient} from '@sanity/client'
import {lintItem, errorCount} from '../lib/lint.ts'
import {check, buildPatch} from '../lib/workflow.ts'

type Proposal = {objectiveId: string; examId: string; stem: string; options: {text: string; isCorrect?: boolean; whyWrong?: string}[]; rationale: string; cognitiveLevel?: string}

const file = process.argv[2]
if (!file) {
  console.error('Pass a JSON file of proposals')
  process.exit(1)
}
const proposals: Proposal[] = JSON.parse(readFileSync(file, 'utf8'))
const dry = !process.env.SANITY_WRITE_TOKEN
const client = dry
  ? null
  : createClient({projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', apiVersion: '2026-09-01', token: process.env.SANITY_WRITE_TOKEN, useCdn: false})

const AGENT = 'drafting-agent'

for (const [i, p] of proposals.entries()) {
  const doc = {
    _type: 'item',
    exam: {_type: 'reference', _ref: p.examId},
    objective: {_type: 'reference', _ref: p.objectiveId},
    stem: p.stem,
    options: p.options.map((o, k) => ({_key: `o${k}`, _type: 'option', text: o.text, isCorrect: Boolean(o.isCorrect), ...(o.whyWrong ? {whyWrong: o.whyWrong} : {})})),
    rationale: p.rationale,
    cognitiveLevel: p.cognitiveLevel,
    state: 'draft',
    author: AGENT,
    log: [] as object[],
  }
  const findings = lintItem(doc)
  const errs = errorCount(findings)
  const req = {action: 'submit', current: 'draft' as const, actor: AGENT, actorType: 'agent' as const, lintErrors: errs}
  const result = check(req)
  if (result.ok) {
    const patch = buildPatch(req, result.transition)
    Object.assign(doc, patch.set)
    doc.log.push(patch.append)
  }
  const status = result.ok ? 'submitted for review' : `kept as draft (${result.reason})`
  console.log(`#${i + 1} ${status}`)
  for (const f of findings) console.log(`   ${f.level}: ${f.message}`)
  if (client) {
    const created = await client.create(doc)
    console.log(`   created ${created._id}`)
  }
}
if (dry) console.log('\nDry run: set SANITY_WRITE_TOKEN to write to your dataset.')
