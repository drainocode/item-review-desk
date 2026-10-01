import Link from 'next/link'
import {sanityFetch} from '../sanity/fetch'
import {EXAMS_QUERY} from '../sanity/queries'

export const revalidate = 60

type Exam = {_id: string; title: string; slug: string; audience?: string; passMark?: number; live: number}

export default async function Home() {
  const exams = await sanityFetch<Exam[]>(EXAMS_QUERY)
  return (
    <main>
      <h1>Item Review Desk</h1>
      <p className="muted">Practice banks built only from items that passed SME review. Writers and reviewers work in the <Link href="/studio">Studio</Link>; the <Link href="/board">board</Link> shows how each blueprint is filling up.</p>
      {exams.map((e) => (
        <div className="card" key={e._id}>
          <h2 style={{margin: 0}}>{e.title}</h2>
          <p className="muted" style={{margin: '4px 0 10px'}}>{e.audience} Pass mark {e.passMark}%. {e.live} live items.</p>
          <Link href={`/practice/${e.slug}`}>Start practice</Link>
        </div>
      ))}
      {exams.length === 0 && <p>No exams yet. Import the seed data (see README).</p>}
    </main>
  )
}
