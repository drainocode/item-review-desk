// Loads seed.ndjson into your Sanity dataset using the HTTP API (no Sanity CLI login needed).
// Needs: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET (default production), SANITY_WRITE_TOKEN
import {readFileSync} from 'node:fs'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN
if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}
const docs = readFileSync(new URL('../seed.ndjson', import.meta.url), 'utf8')
  .split('\n').filter(Boolean).map((l) => JSON.parse(l))
const res = await fetch(`https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}?returnIds=true`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
  body: JSON.stringify({mutations: docs.map((doc) => ({createOrReplace: doc}))}),
})
const body = await res.json()
if (!res.ok) {
  console.error('Import failed', res.status, JSON.stringify(body, null, 2))
  process.exit(1)
}
console.log(`Imported ${docs.length} documents into ${projectId}/${dataset}`)
