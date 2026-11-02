import { getRequestConfig } from 'next-intl/server'
import { appLocale } from './locale'

export default getRequestConfig(async () => ({
  locale: appLocale,
  messages: (await import(`../../messages/${appLocale}.json`)).default,
}))
