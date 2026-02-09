"use client"

import { ReactNode, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getToken } from "@/services/session"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace(`/${locale}/login`)
    }
  }, [locale, router])

  return <>{children}</>
}
