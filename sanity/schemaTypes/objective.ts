import {defineField, defineType} from 'sanity'

export const objective = defineType({
  name: 'objective',
  title: 'Learning objective',
  type: 'document',
  fields: [
    defineField({name: 'code', type: 'string', description: 'Short code, for example CS-2.1', validation: (r) => r.required()}),
    defineField({name: 'statement', type: 'text', rows: 2, description: 'Starts with an observable verb: "Handle", "Identify", "Explain"...', validation: (r) => r.required()}),
    defineField({name: 'exam', type: 'reference', to: [{type: 'exam'}], validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'code', subtitle: 'statement'}},
})
