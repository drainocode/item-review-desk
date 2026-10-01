import {defineQuery} from 'next-sanity'

export const EXAMS_QUERY = defineQuery(`*[_type == "exam"] | order(title asc){
  _id, title, "slug": slug.current, audience, passMark,
  "live": count(*[_type == "item" && state == "approved" && references(^._id)])
}`)

// Only approved items reach candidates. The key is sent to the page so the
// quiz can mark answers without another round trip; this is a practice bank.
export const PRACTICE_QUERY = defineQuery(`*[_type == "exam" && slug.current == $slug][0]{
  _id, title, audience, passMark,
  "items": *[_type == "item" && state == "approved" && references(^._id)] | order(objective->code asc){
    _id, stem, rationale, cognitiveLevel,
    "objective": objective->{code, statement},
    "options": options[]{_key, text, isCorrect, whyWrong}
  }
}`)

export const BOARD_QUERY = defineQuery(`*[_type == "exam"] | order(title asc){
  _id, title,
  "rows": blueprint[]{
    targetItems,
    "code": objective->code,
    "statement": objective->statement,
    "approved": count(*[_type == "item" && state == "approved" && objective._ref == ^.objective._ref]),
    "inReview": count(*[_type == "item" && state == "in_review" && objective._ref == ^.objective._ref]),
    "drafts": count(*[_type == "item" && state in ["draft", "changes_requested"] && objective._ref == ^.objective._ref])
  },
  "recent": *[_type == "item" && references(^._id) && defined(log)] | order(_updatedAt desc)[0...8]{
    _id, stem, state, "last": log[-1]
  }
}`)
