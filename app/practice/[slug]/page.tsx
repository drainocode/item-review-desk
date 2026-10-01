import {notFound} from 'next/navigation'
import {sanityFetch} from '../../../sanity/fetch'
import {PRACTICE_QUERY} from '../../../sanity/queries'
import {Quiz, type QuizItem} from './Quiz'

export const revalidate = 60

type Data = {title: string; audience?: string; passMark?: number; items: QuizItem[]} | null

export default async function PracticePage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  const data = await sanityFetch<Data>(PRACTICE_QUERY, {slug})
  if (!data) notFound()
  return (
    <main>
      <p><a href="/">All exams</a></p>
      <h1>{data.title}</h1>
      <p className="muted">{data.items.length} approved items. Pass mark {data.passMark ?? 70}%.</p>
      <Quiz items={data.items} passMark={data.passMark ?? 70} />
    </main>
  )
}
