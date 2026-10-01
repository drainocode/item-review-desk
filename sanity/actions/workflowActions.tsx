'use client'
import {useState} from 'react'
import {Button, Card, Stack, Text, TextArea} from '@sanity/ui'
import {useCurrentUser, useDocumentOperation, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {TRANSITIONS, check, buildPatch, type ItemState, type Transition} from '../../lib/workflow'
import {lintItem, errorCount, type ItemLike} from '../../lib/lint'

type ItemDoc = ItemLike & {state?: ItemState; author?: string}

function makeAction(t: Transition): DocumentActionComponent {
  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const {patch, publish} = useDocumentOperation(props.id, props.type)
    const user = useCurrentUser()
    const [open, setOpen] = useState(false)
    const [note, setNote] = useState('')
    const [error, setError] = useState<string | null>(null)
    const doc = (props.draft ?? props.published) as ItemDoc | null
    const current: ItemState = doc?.state ?? 'draft'
    if (!t.from.includes(current)) return null

    const actor = user?.email || user?.name || user?.id || 'unknown'
    const lintErrors = errorCount(lintItem(doc ?? {}))

    const run = () => {
      const req = {action: t.action, current, actor, actorType: 'human' as const, author: doc?.author, note, lintErrors}
      const result = check(req)
      if (!result.ok) {
        setError(result.reason)
        return
      }
      const p = buildPatch(req, result.transition)
      patch.execute([{setIfMissing: {log: []}}, {set: p.set}, {insert: {after: 'log[-1]', items: [p.append]}}])
      // Approved, retired and reopened states should be visible to the practice site straight away.
      if (!publish.disabled) publish.execute()
      setOpen(false)
      props.onComplete()
    }

    const blocked = t.needsCleanLint && lintErrors > 0
    return {
      label: t.label,
      tone: t.action === 'approve' ? 'positive' : t.action === 'requestChanges' ? 'caution' : 'default',
      title: blocked ? `Fix ${lintErrors} item-writing error(s) first` : undefined,
      disabled: blocked,
      onHandle: () => (t.needsNote || t.reviewerMustDifferFromAuthor ? setOpen(true) : run()),
      dialog: open && {
        type: 'dialog',
        header: t.label,
        onClose: () => setOpen(false),
        content: (
          <Stack space={3} padding={2}>
            <Text size={1}>
              Moving from <b>{current}</b> to <b>{t.to}</b> as {actor}.
            </Text>
            <TextArea rows={3} value={note} placeholder={t.needsNote ? 'Required: what needs to change, or why' : 'Optional note for the log'} onChange={(e) => setNote(e.currentTarget.value)} />
            {error && (
              <Card tone="critical" padding={2} radius={2}>
                <Text size={1}>{error}</Text>
              </Card>
            )}
            <Button text={t.label} tone="primary" onClick={run} />
          </Stack>
        ),
      },
    }
  }
  Action.displayName = `Workflow_${t.action}`
  return Action
}

export const workflowActions: DocumentActionComponent[] = TRANSITIONS.map(makeAction)
