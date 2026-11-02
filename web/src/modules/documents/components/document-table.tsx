import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteDocumentAction } from '../actions'
import type { Document, DocumentStatus } from '../types'

interface Props {
  documents: Document[]
}

const statusVariant: Record<DocumentStatus, 'default' | 'secondary' | 'outline'> = {
  published: 'default',
  review: 'secondary',
  draft: 'outline',
}

export async function DocumentTable({ documents }: Props) {
  const t = await getTranslations('documents')
  const locale = await getLocale()

  if (documents.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('noResults')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/documents/new" />} nativeButton={false} variant="outline" size="sm">
            {t('newDocument')}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('table.title')}</TableHead>
          <TableHead>{t('table.status')}</TableHead>
          <TableHead>{t('table.summary')}</TableHead>
          <TableHead>{t('table.created')}</TableHead>
          <TableHead className="text-right">{t('table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="font-medium">
              <Link href={`/documents/${document.id}`} className="hover:underline">
                {document.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[document.status]}>{t(`status.${document.status}`)}</Badge>
            </TableCell>
            <TableCell className="max-w-md truncate text-muted-foreground">
              {document.summary ?? t('table.noSummary')}
            </TableCell>
            <TableCell>{new Date(document.createdAt).toLocaleDateString(locale)}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  render={<Link href={`/documents/${document.id}`} />} nativeButton={false}
                  variant="outline"
                  size="sm"
                >
                  {t('table.edit')}
                </Button>
                <form action={deleteDocumentAction.bind(null, document.id)}>
                  <Button type="submit" variant="destructive" size="sm">
                    {t('table.delete')}
                  </Button>
                </form>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
