"use client"

import { Table, Button } from "antd"
import { DeleteOutlined } from "@ant-design/icons"
import { useTranslations } from "next-intl"
import type { UserItem } from "@/services/user"

type Props = {
  users: UserItem[]
  loading: boolean
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number, pageSize: number) => void
  onDeleteClick: (user: UserItem) => void
}

export default function UsersTable({
  users,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  onDeleteClick
}: Props) {
  const t = useTranslations()

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-lg font-semibold mb-3">{t("users.listTitle")}</div>
      <Table<UserItem>
        rowKey="id"
        loading={loading}
        dataSource={users}
        scroll={{ x: true }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (tot) => `${t("users.total")}: ${tot}`,
          onChange: (p, ps) => onPageChange(p, ps)
        }}
        showHeader
        columns={[
          { title: t("users.name"), dataIndex: "name" },
          { title: t("users.email"), dataIndex: "email" },
          { title: t("users.role"), dataIndex: "role" },
          {
            title: "",
            width: 80,
            render: (_, r) => (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDeleteClick(r)}
              />
            )
          }
        ]}
      />
    </div>
  )
}
