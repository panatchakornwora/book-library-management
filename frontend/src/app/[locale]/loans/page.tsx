"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Pagination } from "antd"
import { useTranslations } from "next-intl"
import AppLayout from "@/components/layout/AppLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import { listLoanHistory, listMyLoanHistory } from "@/services/loan"
import { getUserFromToken } from "@/services/session"
import LoanHistoryTable from "@/components/loans/loanHistoryTable"

type LoanHistoryItem = {
  id: string
  borrowedAt: string
  dueDate: string | null
  returnedAt: string | null
  user: { id: string; name: string; email: string; role: string }
  book: { id: string; title: string; author: string }
}

export default function LoanHistoryPage() {
  const t = useTranslations("loans")
  const [mounted, setMounted] = useState(false)
  const currentUser = useMemo(() => getUserFromToken(), [])
  const canSeeAll = currentUser?.role === "ADMIN" || currentUser?.role === "LIBRARIAN"
  const [items, setItems] = useState<LoanHistoryItem[]>([])
  const [myItems, setMyItems] = useState<LoanHistoryItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    async (p = page, ps = pageSize) => {
      setLoading(true)
      try {
        const myHistory = await listMyLoanHistory(1, 20)
        setMyItems(myHistory.items)
        if (canSeeAll) {
          const data = await listLoanHistory(p, ps)
          setItems(data.items)
          setTotal(data.total)
          setPage(data.page)
          setPageSize(data.pageSize)
        }
      } finally {
        setLoading(false)
      }
    },
    [canSeeAll, page, pageSize]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    load()
  }, [mounted, load])

  return (
    <AuthGuard>
      <AppLayout>
        <div className="text-2xl font-semibold">{t("title")}</div>
        <div className="text-gray-900! mt-2">{t("subtitle")}</div>

        {mounted ? (
          <div className="mt-6 bg-white rounded-xl shadow">
            <div className="px-4 pt-4 pb-2 text-lg font-semibold">{t("myTitle")}</div>
            <LoanHistoryTable items={myItems} loading={loading} showUser={false} />
          </div>
        ) : null}

        {mounted && canSeeAll ? (
          <div className="mt-6 bg-white rounded-xl shadow">
            <div className="px-4 pt-4 pb-2 text-lg font-semibold">{t("allTitle")}</div>
            <LoanHistoryTable items={items} loading={loading} showUser />
          </div>
        ) : null}
        {mounted && canSeeAll ? (
          <div className="mt-4 flex justify-end">
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              showTotal={(tot) => `${t("total")}: ${tot}`}
              onChange={(p, ps) => load(p, ps)}
            />
          </div>
        ) : null}
      </AppLayout>
    </AuthGuard>
  )
}
