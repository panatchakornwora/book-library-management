import { redirect } from "next/navigation"

export default async function LocaleIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/login`)
}
