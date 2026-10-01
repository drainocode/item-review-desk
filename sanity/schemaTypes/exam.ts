import {defineField, defineType} from 'sanity'

export const exam = defineType({
  name: 'exam',
  title: 'Exam',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'audience', type: 'string', description: 'Who sits this exam, in one line.'}),
    defineField({name: 'passMark', type: 'number', description: 'Percentage needed to pass.', initialValue: 70, validation: (r) => r.min(0).max(100)}),
    defineField({
      name: 'blueprint',
      title: 'Blueprint',
      description: 'How many live items each objective should have. The review board compares this with approved items.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'blueprintRow',
          fields: [
            defineField({name: 'objective', type: 'reference', to: [{type: 'objective'}], validation: (r) => r.required()}),
            defineField({name: 'targetItems', type: 'number', validation: (r) => r.required().min(1)}),
          ],
          preview: {select: {title: 'objective.code', subtitle: 'targetItems'}, prepare: ({title, subtitle}) => ({title, subtitle: `${subtitle} items`})},
        },
      ],
    }),
  ],
})
