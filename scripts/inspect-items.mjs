// Prints every item (published and draft copies) with its state and last log entry.
// With --publish-drafts, copies each item draft over its published version and removes the draft.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN
const base = `https://${projectId}.api.sanity.io/v2025-02-19/data`
const headers = {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}

const q = encodeURIComponent('*[_type == "item"] | order(_id asc)')
const res = await fetch(`${base}/query/${dataset}?query=${q}&perspective=raw`, {headers})
const {result} = await res.json()
for (const d of result) {
  const last = (d.log || []).at(-1)
  console.log(`${d._id.padEnd(22)} state=${d.state}  last=${last ? `${last.from}->${last.to} by ${last.actor}` : '-'}`)
}
if (process.argv.includes('--publish-drafts')) {
  const drafts = result.filter((d) => d._id.startsWith('drafts.'))
  const mutations = []
  for (const d of drafts) {
    const {_rev, _updatedAt, ...rest} = d
    mutations.push({createOrReplace: {...rest, _id: d._id.replace(/^drafts\./, '')}})
    mutations.push({delete: {id: d._id}})
  }
  if (!mutations.length) { console.log('No drafts to publish'); process.exit(0) }
  const r = await fetch(`${base}/mutate/${dataset}`, {method: 'POST', headers, body: JSON.stringify({mutations})})
  console.log('publish drafts:', r.status, JSON.stringify(await r.json()).slice(0, 300))
}
