import {defineArrayMember, defineField, defineType} from 'sanity'
import {ItemChecksInput} from '../components/ItemChecksInput'
import {STATE_LABELS} from '../../lib/workflow'

export const item = defineType({
  name: 'item',
  title: 'Exam item',
  type: 'document',
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'workflow', title: 'Workflow'},
  ],
  fields: [
    defineField({name: 'exam', type: 'reference', to: [{type: 'exam'}], group: 'content', validation: (r) => r.required()}),
    defineField({
      name: 'objective',
      type: 'reference',
      to: [{type: 'objective'}],
      group: 'content',
      options: {filter: ({document}) => ({filter: 'exam._ref == $exam', params: {exam: (document as {exam?: {_ref?: string}}).exam?._ref ?? ''}})},
    }),
    defineField({name: 'stem', type: 'text', rows: 3, group: 'content', description: 'The question. Pose one clear problem.'}),
    defineField({
      name: 'options',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'option',
          fields: [
            defineField({name: 'text', type: 'string'}),
            defineField({name: 'isCorrect', title: 'Correct answer', type: 'boolean', initialValue: false}),
            defineField({name: 'whyWrong', title: 'Why a candidate might pick this', type: 'string', hidden: ({parent}) => Boolean((parent as {isCorrect?: boolean})?.isCorrect)}),
          ],
          preview: {select: {title: 'text', key: 'isCorrect'}, prepare: ({title, key}) => ({title: `${key ? '[KEY] ' : ''}${title ?? ''}`})},
        }),
      ],
    }),
    defineField({name: 'rationale', type: 'text', rows: 3, group: 'content'}),
    defineField({
      name: 'cognitiveLevel',
      type: 'string',
      group: 'content',
      options: {list: [{title: 'Remember', value: 'remember'}, {title: 'Understand', value: 'understand'}, {title: 'Apply', value: 'apply'}, {title: 'Analyse', value: 'analyse'}], layout: 'radio', direction: 'horizontal'},
    }),
    defineField({
      name: 'checks',
      title: 'Item-writing checks',
      type: 'string',
      group: 'content',
      readOnly: true,
      components: {input: ItemChecksInput},
      description: 'Live checks. Errors block "Submit for review" and "Approve".',
    }),
    defineField({
      name: 'state',
      type: 'string',
      group: 'workflow',
      readOnly: true,
      initialValue: 'draft',
      options: {list: Object.entries(STATE_LABELS).map(([value, title]) => ({value, title}))},
      description: 'Changed only through the actions menu, so every move is logged.',
    }),
    defineField({name: 'author', type: 'string', group: 'workflow', description: 'Email of the writer, or the agent name.'}),
    defineField({name: 'approvedBy', type: 'string', group: 'workflow', readOnly: true}),
    defineField({name: 'approvedAt', type: 'datetime', group: 'workflow', readOnly: true}),
    defineField({
      name: 'log',
      title: 'Transition log',
      type: 'array',
      group: 'workflow',
      readOnly: true,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'transitionLog',
          fields: [
            defineField({name: 'action', type: 'string'}),
            defineField({name: 'from', type: 'string'}),
            defineField({name: 'to', type: 'string'}),
            defineField({name: 'actor', type: 'string'}),
            defineField({name: 'actorType', type: 'string'}),
            defineField({name: 'note', type: 'string'}),
            defineField({name: 'at', type: 'datetime'}),
          ],
          preview: {
            select: {from: 'from', to: 'to', actor: 'actor', actorType: 'actorType', at: 'at', note: 'note'},
            prepare: ({from, to, actor, actorType, at, note}) => ({
              title: `${from} to ${to} by ${actor}${actorType === 'agent' ? ' (agent)' : ''}`,
              subtitle: `${at ? new Date(at).toLocaleString() : ''}${note ? ` | ${note}` : ''}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {stem: 'stem', state: 'state', code: 'objective.code'},
    prepare: ({stem, state, code}) => ({
      title: stem ? String(stem).slice(0, 80) : 'Untitled item',
      subtitle: `${code ?? 'no objective'} | ${STATE_LABELS[state as keyof typeof STATE_LABELS] ?? state}`,
    }),
  },
})
