// Writes seed.ndjson for: npx sanity dataset import seed.ndjson production
import {writeFileSync} from 'node:fs'
import {exam, objectives, blueprint, items} from '../data/seed.ts'

const at = '2026-09-30T12:00:00.000Z'
const docs: object[] = []
docs.push({...exam, blueprint: blueprint.map(([ref, n], i) => ({_key: `bp${i}`, _type: 'blueprintRow', objective: {_type: 'reference', _ref: ref}, targetItems: n}))})
for (const o of objectives) docs.push({...o, _type: 'objective', exam: {_type: 'reference', _ref: exam._id}})

for (const it of items) {
  const log: object[] = []
  const push = (from: string, to: string, actor: string, actorType: string, note: string, action: string) =>
    log.push({_key: `l${log.length}`, _type: 'transitionLog', action, from, to, actor, actorType, note, at})
  if (it.state !== 'draft') push('draft', 'in_review', it.author, it.author === 'drafting-agent' ? 'agent' : 'human', 'Seed import', 'submit')
  if (it.state === 'approved') push('in_review', 'approved', 'seed-import', 'human', 'Sample item approved in seed data', 'approve')
  if (it.state === 'changes_requested') push('in_review', 'changes_requested', 'seed-import', 'human', 'Needs a fourth option and a reason for each distractor', 'requestChanges')
  docs.push({
    _id: it.id,
    _type: 'item',
    exam: {_type: 'reference', _ref: exam._id},
    objective: {_type: 'reference', _ref: it.obj},
    stem: it.stem,
    options: it.options.map(([text, isCorrect, whyWrong], i) => ({_key: `o${i}`, _type: 'option', text, isCorrect: Boolean(isCorrect), ...(whyWrong ? {whyWrong} : {})})),
    rationale: it.rationale,
    cognitiveLevel: it.level,
    state: it.state,
    author: it.author,
    ...(it.state === 'approved' ? {approvedBy: 'seed-import', approvedAt: at} : {}),
    log,
  })
}
writeFileSync('seed.ndjson', docs.map((d) => JSON.stringify(d)).join('\n') + '\n')
console.log(`Wrote ${docs.length} documents to seed.ndjson`)
