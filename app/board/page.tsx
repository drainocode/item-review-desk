import {sanityFetch} from '../../sanity/fetch'
import {BOARD_QUERY} from '../../sanity/queries'

export const revalidate = 30

type Row = {code: string; statement: string; targetItems: number; approved: number; inReview: number; drafts: number}
type Exam = {_id: string; title: string; rows: Row[] | null; recent: {_id: string; stem: string; state: string; last?: {from: string; to: string; actor: string; actorType: string; at: string; note?: string}}[]}

export default async function Board() {
  const exams = await sanityFetch<Exam[]>(BOARD_QUERY)
  return (
    <main>
      <p><a href="/">Home</a></p>
      <h1>Blueprint board</h1>
      <p className="muted">Approved items against the target for each objective, plus the latest workflow moves.</p>
      {exams.map((e) => (
        <div className="card" key={e._id}>
          <h2 style={{marginTop: 0}}>{e.title}</h2>
          <table>
            <thead><tr><th>Objective</th><th>Live / target</th><th>In review</th><th>Drafts</th></tr></thead>
            <tbody>
              {(e.rows ?? []).map((r) => (
                <tr key={r.code}>
                  <td><b>{r.code}</b> <span className="muted">{r.statement}</span></td>
                  <td style={{minWidth: 120}}>
                    {r.approved} / {r.targetItems}
                    <div className="bar"><span style={{width: `${Math.min(100, (r.approved / r.targetItems) * 100)}%`}} /></div>
                  </td>
                  <td>{r.inReview}</td>
                  <td>{r.drafts}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Recent moves</h3>
          <ul>
            {e.recent.map((x) => (
              <li key={x._id}>
                {x.last ? `${x.last.from} to ${x.last.to} by ${x.last.actor}${x.last.actorType === 'agent' ? ' (agent)' : ''}` : x.state}: <span className="muted">{x.stem.slice(0, 70)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </main>
  )
}
