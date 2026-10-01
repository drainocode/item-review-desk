// Workflow for exam items, modelled as data on the item itself.
// Both the Studio actions and the drafting agent go through this file,
// so a person and an agent move an item through the same transitions.

export type ItemState = 'draft' | 'in_review' | 'changes_requested' | 'approved' | 'retired'
export type ActorType = 'human' | 'agent'

export interface Transition {
  action: string
  from: ItemState[]
  to: ItemState
  label: string
  // who is allowed to fire it
  allowed: ActorType[]
  needsNote?: boolean
  // blocks the move while lint errors exist
  needsCleanLint?: boolean
  // the person approving must not be the person who wrote the item
  reviewerMustDifferFromAuthor?: boolean
}

export const TRANSITIONS: Transition[] = [
  {action: 'submit', from: ['draft', 'changes_requested'], to: 'in_review', label: 'Submit for review', allowed: ['human', 'agent'], needsCleanLint: true},
  {action: 'requestChanges', from: ['in_review'], to: 'changes_requested', label: 'Request changes', allowed: ['human'], needsNote: true},
  {action: 'approve', from: ['in_review'], to: 'approved', label: 'Approve for live bank', allowed: ['human'], needsCleanLint: true, reviewerMustDifferFromAuthor: true},
  {action: 'retire', from: ['approved'], to: 'retired', label: 'Retire item', allowed: ['human'], needsNote: true},
  {action: 'reopen', from: ['retired', 'approved'], to: 'draft', label: 'Reopen as draft', allowed: ['human'], needsNote: true},
]

export const STATE_LABELS: Record<ItemState, string> = {
  draft: 'Draft',
  in_review: 'In SME review',
  changes_requested: 'Changes requested',
  approved: 'Approved (live)',
  retired: 'Retired',
}

export interface LogEntry {
  _key: string
  _type: 'transitionLog'
  action: string
  from: ItemState
  to: ItemState
  actor: string
  actorType: ActorType
  note?: string
  at: string
}

export interface TransitionRequest {
  action: string
  current: ItemState
  actor: string
  actorType: ActorType
  author?: string
  note?: string
  lintErrors: number
}

export type TransitionCheck = {ok: true; transition: Transition} | {ok: false; reason: string}

export function available(current: ItemState, actorType: ActorType): Transition[] {
  return TRANSITIONS.filter((t) => t.from.includes(current) && t.allowed.includes(actorType))
}

export function check(req: TransitionRequest): TransitionCheck {
  const t = TRANSITIONS.find((x) => x.action === req.action)
  if (!t) return {ok: false, reason: `Unknown action "${req.action}"`}
  if (!t.from.includes(req.current)) {
    return {ok: false, reason: `Cannot ${t.label.toLowerCase()} from "${STATE_LABELS[req.current]}"`}
  }
  if (!t.allowed.includes(req.actorType)) {
    return {ok: false, reason: `${t.label} is reserved for a ${t.allowed.join(' or ')} reviewer`}
  }
  if (t.needsNote && !(req.note && req.note.trim().length >= 5)) {
    return {ok: false, reason: `${t.label} needs a short note explaining why`}
  }
  if (t.needsCleanLint && req.lintErrors > 0) {
    return {ok: false, reason: `Fix ${req.lintErrors} item-writing error(s) first`}
  }
  if (t.reviewerMustDifferFromAuthor && req.author && req.author === req.actor) {
    return {ok: false, reason: 'The author of an item cannot approve it'}
  }
  return {ok: true, transition: t}
}

let counter = 0
function key(): string {
  counter += 1
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// Returns the fields to set on the item, including the new log entry.
export function buildPatch(req: TransitionRequest, t: Transition, now = new Date()) {
  const entry: LogEntry = {
    _key: key(),
    _type: 'transitionLog',
    action: t.action,
    from: req.current,
    to: t.to,
    actor: req.actor,
    actorType: req.actorType,
    note: req.note?.trim() || undefined,
    at: now.toISOString(),
  }
  const set: Record<string, unknown> = {state: t.to}
  if (t.to === 'approved') {
    set.approvedBy = req.actor
    set.approvedAt = entry.at
  }
  return {set, append: entry}
}
