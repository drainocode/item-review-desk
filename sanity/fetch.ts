import {client} from './client'

// OFFLINE_SEED=1 runs the same GROQ queries against seed.ndjson with groq-js,
// so the site can be previewed (and the queries tested) without a Sanity project.
export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  if (process.env.OFFLINE_SEED === '1') {
    const [{parse, evaluate}, {readFile}] = await Promise.all([import('groq-js'), import('node:fs/promises')])
    const raw = await readFile(process.cwd() + '/seed.ndjson', 'utf8')
    const dataset = raw.trim().split('\n').map((l) => JSON.parse(l))
    const result = await evaluate(parse(query, {params}), {dataset, params})
    return (await result.get()) as T
  }
  return client.fetch<T>(query, params)
}
