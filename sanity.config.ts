'use client'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {dataset, projectId} from './sanity/env'
import {schemaTypes} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {workflowActions} from './sanity/actions/workflowActions'

export default defineConfig({
  name: 'item-review-desk',
  title: 'Item Review Desk',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {types: schemaTypes},
  plugins: [structureTool({structure})],
  document: {
    actions: (prev, context) => {
      if (context.schemaType !== 'item') return prev
      // Items are only published through workflow transitions, so drop the plain Publish button.
      const rest = prev.filter((a) => a.action !== 'publish')
      return [...workflowActions, ...rest]
    },
  },
})
