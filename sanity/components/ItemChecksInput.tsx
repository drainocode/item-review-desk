'use client'
import {Badge, Card, Flex, Stack, Text} from '@sanity/ui'
import {useFormValue} from 'sanity'
import {lintItem, type ItemLike} from '../../lib/lint'

// Reads the whole item from the form and shows item-writing findings as the author types.
export function ItemChecksInput() {
  const doc = useFormValue([]) as ItemLike | undefined
  const findings = lintItem(doc ?? {})
  if (findings.length === 0) {
    return (
      <Card padding={3} radius={2} tone="positive" border>
        <Text size={1}>No problems found. This item can go to review.</Text>
      </Card>
    )
  }
  return (
    <Stack space={2}>
      {findings.map((f) => (
        <Card key={f.code + f.message} padding={3} radius={2} tone={f.level === 'error' ? 'critical' : 'caution'} border>
          <Flex gap={2} align="center">
            <Badge tone={f.level === 'error' ? 'critical' : 'caution'}>{f.level}</Badge>
            <Text size={1}>{f.message}</Text>
          </Flex>
        </Card>
      ))}
    </Stack>
  )
}
