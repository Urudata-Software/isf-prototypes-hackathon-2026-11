import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { createDocumentAction } from '@/modules/documents/actions'
import { DocumentForm } from '@/modules/documents/components/document-form'

export default async function NewDocumentPage() {
  const t = await getTranslations('documents')

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/documents" />} nativeButton={false} variant="ghost" size="sm">
          {t('back')}
        </Button>
        <h1 className="text-2xl font-semibold">{t('form.newTitle')}</h1>
      </div>

      <DocumentForm action={createDocumentAction} mode="create" />
    </div>
  )
}
