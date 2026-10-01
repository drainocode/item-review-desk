'use client'
import {useState} from 'react'
import {Button, Card, Stack, Text, TextArea} from '@sanity/ui'
import {useClient, useCurrentUser, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {TRANSITIONS, check, buildPatch, type ItemState, type Transition} from '../../lib/workflow'
import {lintItem, errorCount, type ItemLike} from '../../lib/lint'
import {apiVersion} from '../env'

type ItemDoc = ItemLike & {state?: ItemState; author?: string}

function makeAction(t: Transition): DocumentActionComponent {
  const Action: DocumentActionComponent = (props: DocumentActionProps) => {
    const client = useClient({apiVersion})
    const [busy, setBusy] = useState(false)
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
      // Write the transition straight to the published document in one transaction.
      // (An earlier version patched the draft and then called publish in the same tick;
      // publish was still disabled at that moment, so the change stayed an unpublished draft.)
      const base = (props.draft ?? props.published) as (Record<string, unknown> & {log?: unknown[]}) | null
      if (!base) return
      const {_rev, _updatedAt, ...rest} = base as Record<string, unknown>
      void _rev
      void _updatedAt
      const next = {
        ...rest,
        ...p.set,
        _id: props.id,
        _type: props.type,
        log: [...((base.log as unknown[]) ?? []), p.append],
      }
      const tx = client.transaction().createOrReplace(next as {_id: string; _type: string})
      if (props.draft) tx.delete(`drafts.${props.id}`)
      setBusy(true)
      tx.commit()
        .then(() => {
          setOpen(false)
          props.onComplete()
        })
        .catch((err: Error) => setError(err.message))
        .finally(() => setBusy(false))
      return
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
            <Button text={busy ? 'Saving...' : t.label} tone="primary" disabled={busy} onClick={run} />
          </Stack>
        ),
      },
    }
  }
  Action.displayName = `Workflow_${t.action}`
  return Action
}

export const workflowActions: DocumentActionComponent[] = TRANSITIONS.map(makeAction)
