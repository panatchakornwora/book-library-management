"use client"

import { Table } from "antd"
import { useTranslations } from "next-intl"
import type { MostBorrowedItem } from "@/services/book"

type Props = {
  items: MostBorrowedItem[]
  loading: boolean
}

export default function MostBorrowedTable({ items, loading }: Props) {
  const t = useTranslations("books")

  return (
    <div className="mb-6 bg-white rounded-xl shadow p-4">
      <div className="text-sm font-semibold text-gray-700 mb-3">{t("mostBorrowedTitle")}</div>
      <Table
        rowKey={(r) => r.book.id}
        dataSource={items}
        pagination={false}
        loading={loading}
        scroll={{ x: true }}
        columns={[
          {
            title: t("columns.title"),
            dataIndex: ["book", "title"]
          },
          {
            title: t("columns.author"),
            dataIndex: ["book", "author"]
          },
          {
            title: t("mostBorrowedCount"),
            dataIndex: "borrowCount",
            width: 140
          }
        ]}
        locale={{
          emptyText: t("mostBorrowedEmpty")
        }}
        size="small"
      />
    </div>
  )
}
