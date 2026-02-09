"use client"

import { Table, Tag } from "antd"
import dayjs from "dayjs"
import { useTranslations } from "next-intl"

type LoanHistoryItem = {
  id: string
  borrowedAt: string
  dueDate: string | null
  returnedAt: string | null
  user: { id: string; name: string; email: string; role: string }
  book: { id: string; title: string; author: string }
}

type Props = {
  items: LoanHistoryItem[]
  loading: boolean
  showUser: boolean
}

export default function LoanHistoryTable({ items, loading, showUser }: Props) {
  const t = useTranslations("loans")

  const columns = [
    {
      title: t("columns.book"),
      render: (_: unknown, r: LoanHistoryItem) => (
        <div>
          <div className="font-medium">{r.book.title}</div>
          <div className="text-xs text-gray-500">{r.book.author}</div>
        </div>
      )
    },
    ...(showUser
      ? [
          {
            title: t("columns.user"),
            render: (_: unknown, r: LoanHistoryItem) => (
              <div>
                <div className="font-medium">{r.user.name}</div>
                <div className="text-xs text-gray-500">{r.user.email}</div>
              </div>
            )
          }
        ]
      : []),
    {
      title: t("columns.borrowedAt"),
      dataIndex: "borrowedAt",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm")
    },
    {
      title: t("columns.dueDate"),
      dataIndex: "dueDate",
      render: (v: string | null) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-")
    },
    {
      title: t("columns.returnedAt"),
      dataIndex: "returnedAt",
      render: (v: string | null) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-")
    },
    {
      title: t("columns.status"),
      render: (_: unknown, r: LoanHistoryItem) => {
        if (r.returnedAt) return <Tag color="green">{t("returned")}</Tag>
        if (r.dueDate && dayjs(r.dueDate).isBefore(dayjs()))
          return <Tag color="red">{t("overdue")}</Tag>
        return <Tag color="gold">{t("borrowed")}</Tag>
      }
    }
  ]

  return (
    <Table<LoanHistoryItem>
      rowKey="id"
      loading={loading}
      dataSource={items}
      pagination={false}
      columns={columns}
      scroll={{ x: true }}
    />
  )
}
