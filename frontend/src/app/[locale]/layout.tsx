import "antd/dist/reset.css"
import "../globals.css"

import { NextIntlClientProvider } from "next-intl"
import { notFound } from "next/navigation"
import { locales, type Locale } from "@/i18n"

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) notFound()

  let messages: Record<string, string>
  try {
    messages = (await import(`../../translate/${locale}.json`)).default
  } catch {
    notFound()
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
