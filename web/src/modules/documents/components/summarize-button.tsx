'use client'

import { useFormStatus } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

// useFormStatus reads the enclosing form, so this must stay a child of it.
export function SummarizeButton() {
  const { pending } = useFormStatus()
  const t = useTranslations('documents.detail')

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? t('summarizing') : t('summarize')}
    </Button>
  )
}
