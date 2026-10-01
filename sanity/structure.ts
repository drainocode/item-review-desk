import type {StructureResolver} from 'sanity/structure'
import {STATE_LABELS, type ItemState} from '../lib/workflow'

const order: ItemState[] = ['in_review', 'changes_requested', 'draft', 'approved', 'retired']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Item review desk')
    .items([
      S.listItem()
        .title('Review queue')
        .child(
          S.list()
            .title('By state')
            .items(
              order.map((state) =>
                S.listItem()
                  .id(state)
                  .title(STATE_LABELS[state])
                  .child(S.documentList().title(STATE_LABELS[state]).filter('_type == "item" && coalesce(state, "draft") == $state').params({state}).defaultOrdering([{field: '_updatedAt', direction: 'desc'}])),
              ),
            ),
        ),
      S.divider(),
      S.documentTypeListItem('item').title('All items'),
      S.documentTypeListItem('objective').title('Learning objectives'),
      S.documentTypeListItem('exam').title('Exams and blueprints'),
    ])
