import { Suspense } from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { getDocuments } from '@/modules/documents/server'
import { DocumentTable } from '@/modules/documents/components/document-table'
import { DocumentTableSkeleton } from '@/modules/documents/components/document-table-skeleton'

async function DocumentList() {
  const { items, totalCount } = await getDocuments()
  const t = await getTranslations('documents')

  return (
    <>
      <p className="text-sm text-muted-foreground">{t('documentCount', { count: totalCount })}</p>
      <DocumentTable documents={items} />
    </>
  )
}

export default async function DocumentsPage() {
  const t = await getTranslations('documents')

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <Button render={<Link href="/documents/new" />} nativeButton={false}>{t('newDocument')}</Button>
      </div>

      {/* The shell renders immediately; the list streams in when the API responds. */}
      <Suspense fallback={<DocumentTableSkeleton />}>
        <DocumentList />
      </Suspense>
    </div>
  )
}
