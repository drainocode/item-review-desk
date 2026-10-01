import {test} from 'node:test'
import assert from 'node:assert/strict'
import {check, buildPatch, available} from './workflow.ts'
import {lintItem, errorCount} from './lint.ts'

const base = {actor: 'sme@example.com', actorType: 'human' as const, lintErrors: 0}

test('agent can submit but not approve', () => {
  assert.equal(check({...base, action: 'submit', current: 'draft', actorType: 'agent', actor: 'drafting-agent'}).ok, true)
  const r = check({...base, action: 'approve', current: 'in_review', actorType: 'agent', actor: 'drafting-agent'})
  assert.equal(r.ok, false)
})

test('author cannot approve own item', () => {
  const r = check({...base, action: 'approve', current: 'in_review', author: 'sme@example.com'})
  assert.equal(r.ok, false)
  assert.equal(check({...base, action: 'approve', current: 'in_review', author: 'writer@example.com'}).ok, true)
})

test('lint errors block submit and approve', () => {
  assert.equal(check({...base, action: 'submit', current: 'draft', lintErrors: 2}).ok, false)
})

test('request changes needs a note', () => {
  assert.equal(check({...base, action: 'requestChanges', current: 'in_review'}).ok, false)
  assert.equal(check({...base, action: 'requestChanges', current: 'in_review', note: 'Distractor B is also defensible'}).ok, true)
})

test('illegal jump is refused', () => {
  assert.equal(check({...base, action: 'approve', current: 'draft'}).ok, false)
})

test('patch records log entry and approver', () => {
  const req = {...base, action: 'approve', current: 'in_review' as const, author: 'w'}
  const c = check(req)
  assert.ok(c.ok)
  if (c.ok) {
    const p = buildPatch(req, c.transition, new Date('2026-10-01T10:00:00Z'))
    assert.equal(p.set.state, 'approved')
    assert.equal(p.set.approvedBy, 'sme@example.com')
    assert.equal(p.append.from, 'in_review')
    assert.equal(p.append.at, '2026-10-01T10:00:00.000Z')
  }
})

test('available lists only allowed moves', () => {
  assert.deepEqual(available('in_review', 'agent').map((t) => t.action), [])
  assert.deepEqual(available('in_review', 'human').map((t) => t.action), ['requestChanges', 'approve'])
})

test('lint catches common item flaws', () => {
  const bad = lintItem({
    stem: 'Which of these is not a good greeting?',
    options: [{text: 'Hello'}, {text: 'All of the above', isCorrect: true}],
  })
  const codes = bad.map((f) => f.code)
  for (const c of ['negative-lowercase', 'option-count', 'catch-all', 'rationale', 'objective']) assert.ok(codes.includes(c), c)
})

test('clean item passes', () => {
  const good = lintItem({
    stem: 'A caller says the same fault has happened three times this month. What should the agent do FIRST?',
    options: [
      {text: 'Acknowledge the repeat problem and check the history of the earlier contacts', isCorrect: true},
      {text: 'Read the standard troubleshooting script from the start'},
      {text: 'Offer a goodwill credit before hearing the details'},
      {text: 'Transfer the call to the technical team straight away'},
    ],
    rationale: 'Checking history avoids repeating failed fixes and shows the customer they were heard.',
    objective: {_ref: 'obj-1'},
    cognitiveLevel: 'apply',
  })
  assert.equal(errorCount(good), 0)
})

test('negative word in the scenario is allowed, in the question it must be capitalised', () => {
  const scenario = lintItem({stem: 'The customer is not happy with the delay. What should the agent say first?'})
  assert.ok(!scenario.some((f) => f.code === 'negative-lowercase'))
  const q = lintItem({stem: 'Which of these is not personal data?'})
  assert.ok(q.some((f) => f.code === 'negative-lowercase'))
  const caps = lintItem({stem: 'Which of these is NOT personal data?'})
  assert.ok(!caps.some((f) => f.code === 'negative-lowercase'))
})
