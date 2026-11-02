import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Emits .next/standalone — a self-contained server carrying only the modules
  // it actually uses, which is what the runtime image copies. No effect on
  // `next dev`.
  output: 'standalone',
}

export default withNextIntl(nextConfig)
