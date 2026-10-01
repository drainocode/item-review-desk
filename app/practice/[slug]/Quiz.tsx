'use client'
import {useState} from 'react'

export type QuizItem = {
  _id: string
  stem: string
  rationale?: string
  cognitiveLevel?: string
  objective?: {code?: string; statement?: string}
  options: {_key: string; text: string; isCorrect?: boolean; whyWrong?: string}[]
}

export function Quiz({items, passMark}: {items: QuizItem[]; passMark: number}) {
  const [picked, setPicked] = useState<Record<string, string>>({})
  const answered = Object.keys(picked).length
  const correct = items.filter((it) => it.options.find((o) => o._key === picked[it._id])?.isCorrect).length
  const pct = answered ? Math.round((correct / answered) * 100) : 0

  return (
    <div>
      {items.map((it, i) => {
        const choice = picked[it._id]
        const chosen = it.options.find((o) => o._key === choice)
        return (
          <div className="card" key={it._id}>
            <p style={{margin: '0 0 6px'}}>
              <span className="tag">{it.objective?.code}</span> <span className="tag">{it.cognitiveLevel}</span>
            </p>
            <p style={{fontWeight: 600}}>
              {i + 1}. {it.stem}
            </p>
            {it.options.map((o) => {
              const state = !choice ? undefined : o.isCorrect ? 'right' : o._key === choice ? 'wrong' : undefined
              return (
                <button key={o._key} className="opt" data-state={state} disabled={Boolean(choice)} onClick={() => setPicked((p) => ({...p, [it._id]: o._key}))}>
                  {o.text}
                </button>
              )
            })}
            {choice && (
              <div style={{marginTop: 10}}>
                {!chosen?.isCorrect && chosen?.whyWrong && <p><b>Why this is tempting:</b> {chosen.whyWrong}</p>}
                <p><b>Rationale:</b> {it.rationale}</p>
              </div>
            )}
          </div>
        )
      })}
      <div className="card" style={{position: 'sticky', bottom: 8}}>
        {answered} of {items.length} answered, {correct} correct ({pct}%). {answered === items.length && items.length > 0 && (pct >= passMark ? 'At pass standard.' : 'Below pass standard; review the rationales above.')}
      </div>
    </div>
  )
}
