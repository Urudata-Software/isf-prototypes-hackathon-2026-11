import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ENTRA_PROVIDER_ID, signIn } from '@/lib/auth'
import { authEnabled } from '@/lib/session'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default async function LoginPage() {
  const t = await getTranslations('auth')

  // Nothing routes here with auth off, but a dead SSO button reads as a bug.
  if (!authEnabled) {
    return (
      <div className="container flex min-h-svh items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{t('notConfigured')}</EmptyTitle>
            <EmptyDescription>{t('notConfiguredHint')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/dashboard" />} nativeButton={false}>
              {t('backToDashboard')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="container flex min-h-svh items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('signIn')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <form
            action={async () => {
              'use server'
              await signIn(ENTRA_PROVIDER_ID, { redirectTo: '/dashboard' })
            }}
          >
            <Button type="submit">{t('continueWithSSO')}</Button>
          </form>
        </EmptyContent>
      </Empty>
    </div>
  )
}
