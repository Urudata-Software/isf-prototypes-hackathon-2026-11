import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export default async function NotFound() {
  const t = await getTranslations('documents')

  return (
    <div className="container flex min-h-svh items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('notFound')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/documents" />} nativeButton={false} variant="outline">
            {t('backToList')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
