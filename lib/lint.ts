// Item-writing checks based on common guidance for single-best-answer
// multiple choice items. Errors block review and approval; warnings do not.

export interface ItemOption {
  _key?: string
  text?: string
  isCorrect?: boolean
}

export interface ItemLike {
  stem?: string
  options?: ItemOption[]
  rationale?: string
  objective?: {_ref?: string} | null
  cognitiveLevel?: string
}

export interface Finding {
  code: string
  level: 'error' | 'warning'
  message: string
}

const NEGATIVE_WORDS = ['not', 'except', 'least', 'never']
const CATCH_ALL = /\b(all|none|both|neither) of the (above|options|answers)\b/i

export function lintItem(item: ItemLike): Finding[] {
  const out: Finding[] = []
  const stem = (item.stem ?? '').trim()
  const options = (item.options ?? []).map((o) => ({...o, text: (o.text ?? '').trim()}))

  if (stem.length < 15) {
    out.push({code: 'stem-short', level: 'error', message: 'Stem is missing or too short to pose a clear problem.'})
  }

  // Only the sentence that asks the question matters: "not" in the scenario is fine,
  // "Which of these is not..." is the classic trap.
  const sentences = stem.split(/(?<=[.!?])\s+/).filter(Boolean)
  const question = sentences.find((s) => s.trim().endsWith('?')) ?? sentences[sentences.length - 1] ?? ''
  for (const word of NEGATIVE_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, 'gi')
    for (const m of question.matchAll(re)) {
      if (m[0] !== m[0].toUpperCase()) {
        out.push({code: 'negative-lowercase', level: 'error', message: `Negative word "${m[0]}" in the stem must be in capitals so candidates do not miss it.`})
      }
    }
  }

  if (options.length < 3 || options.length > 5) {
    out.push({code: 'option-count', level: 'error', message: `Use 3 to 5 options (found ${options.length}).`})
  }

  const empty = options.filter((o) => o.text.length === 0).length
  if (empty > 0) out.push({code: 'option-empty', level: 'error', message: `${empty} option(s) have no text.`})

  const keys = options.filter((o) => o.isCorrect).length
  if (keys !== 1) {
    out.push({code: 'key-count', level: 'error', message: `Mark exactly one correct option (found ${keys}).`})
  }

  const seen = new Set<string>()
  for (const o of options) {
    const norm = o.text.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ')
    if (norm && seen.has(norm)) {
      out.push({code: 'option-duplicate', level: 'error', message: `Duplicate option: "${o.text}".`})
    }
    seen.add(norm)
  }

  if (options.some((o) => CATCH_ALL.test(o.text))) {
    out.push({code: 'catch-all', level: 'error', message: 'Avoid "all of the above" and "none of the above" style options.'})
  }

  const key = options.find((o) => o.isCorrect)
  const distractors = options.filter((o) => !o.isCorrect && o.text.length > 0)
  if (key && distractors.length > 0) {
    const mean = distractors.reduce((s, o) => s + o.text.length, 0) / distractors.length
    if (key.text.length > mean * 1.6 && key.text.length - mean > 20) {
      out.push({code: 'key-longest', level: 'warning', message: 'The correct option is much longer than the distractors, which can give the answer away.'})
    }
    const stemWords = new Set(stem.toLowerCase().match(/[a-z]{5,}/g) ?? [])
    const keyWords = key.text.toLowerCase().match(/[a-z]{5,}/g) ?? []
    const overlap = keyWords.filter((w) => stemWords.has(w)).length
    const distractorOverlap = distractors.map((d) => (d.text.toLowerCase().match(/[a-z]{5,}/g) ?? []).filter((w) => stemWords.has(w)).length)
    if (overlap >= 2 && distractorOverlap.every((n) => n === 0)) {
      out.push({code: 'clang', level: 'warning', message: 'Only the correct option repeats words from the stem (a "clang" cue).'})
    }
  }

  if ((item.rationale ?? '').trim().length < 20) {
    out.push({code: 'rationale', level: 'error', message: 'Add a rationale explaining why the key is right and the distractors are wrong.'})
  }

  if (!item.objective?._ref) {
    out.push({code: 'objective', level: 'error', message: 'Link the item to a learning objective.'})
  }

  if (!item.cognitiveLevel) {
    out.push({code: 'level', level: 'warning', message: 'Set a cognitive level so the blueprint can be balanced.'})
  }

  return out
}

export const errorCount = (f: Finding[]) => f.filter((x) => x.level === 'error').length
