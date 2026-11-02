import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentForm } from '@/modules/documents/components/document-form'
import { SummarizeButton } from '@/modules/documents/components/summarize-button'
import { summarizeDocumentAction, updateDocumentAction } from '@/modules/documents/actions'
import { getDocumentById } from '@/modules/documents/server'

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const document = await getDocumentById(id)
  const t = await getTranslations('documents')

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/documents" />} nativeButton={false} variant="ghost" size="sm">
          {t('back')}
        </Button>
        <h1 className="text-2xl font-semibold">{t('form.editTitle')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.summaryHeading')}</CardTitle>
          <CardAction>
            <form action={summarizeDocumentAction.bind(null, id)}>
              <SummarizeButton />
            </form>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {document.summary ?? t('detail.noSummary')}
          </p>
        </CardContent>
      </Card>

      <DocumentForm
        action={updateDocumentAction.bind(null, id)}
        defaultValues={document}
        mode="edit"
      />
    </div>
  )
}
