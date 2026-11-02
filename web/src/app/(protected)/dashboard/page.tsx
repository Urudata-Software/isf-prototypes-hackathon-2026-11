import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { signOut } from '@/lib/auth'
import { authEnabled, getSession } from '@/lib/session'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await getSession()
  const t = await getTranslations('dashboard')
  const tAuth = await getTranslations('auth')

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">
        {t('signedInAs')} <span className="font-medium text-foreground">{session?.user?.email}</span>
      </p>

      <Button render={<Link href="/documents" />} nativeButton={false} variant="outline">
        {t('documentsLink')}
      </Button>

      {authEnabled ? (
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
        >
          <Button type="submit" variant="outline">
            {tAuth('signOut')}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">{t('demoMode')}</p>
      )}
    </div>
  )
}
