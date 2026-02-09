"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Modal, message } from "antd"
import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import { createUser, deleteUser, listUsers, UserItem } from "@/services/user"
import { getUserFromToken } from "@/services/session"
import CreateUserForm from "@/components/users/createUserForm"
import UsersTable from "@/components/users/usersTable"
import type { FormValues } from "@/components/users/createUserForm"

export default function UsersPage() {
  const t = useTranslations()
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null)
  const [messageApi, contextHolder] = message.useMessage()
  const currentUser = useMemo(() => getUserFromToken(), [])
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const roleOptions = useMemo<Array<{ value: UserItem["role"]; label: string }>>(() => {
    const base: Array<{ value: UserItem["role"]; label: string }> = [
      { value: "MEMBER", label: t("roles.member") }
    ]
    if (currentUser?.role === "ADMIN") {
      return [{ value: "LIBRARIAN", label: t("roles.librarian") }, ...base]
    }
    if (currentUser?.role === "LIBRARIAN") {
      return base
    }
    return base
  }, [currentUser?.role, t])

  const load = useCallback(
    async (p = page, ps = pageSize) => {
      setLoading(true)
      try {
        const data = await listUsers(p, ps)
        setUsers(data.items)
        setTotal(data.total)
        setPage(data.page)
        setPageSize(data.pageSize)
      } finally {
        setLoading(false)
      }
    },
    [page, pageSize]
  )

  useEffect(() => {
    if (currentUser?.role && currentUser.role !== "ADMIN") {
      router.replace(`/${locale}/book`)
      return
    }
    load()
  }, [currentUser?.role, locale, load, router])

  const onCreate = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await createUser(values)
      await load()
      messageApi.success(t("users.createSuccess"))
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    setDeletingId(deleteTarget.id)
    try {
      await deleteUser(deleteTarget.id)
      await load()
      messageApi.success(t("users.deleteSuccess"))
    } catch {
      messageApi.error(t("users.deleteFailed"))
    } finally {
      setDeletingId(null)
      setDeleteTarget(null)
    }
  }

  return (
    <AuthGuard>
      <AppLayout>
        {contextHolder}
        <div className="text-2xl font-semibold">{t("nav.managePeople")}</div>
        <div className="text-gray-900 mt-2">{t("users.subtitle")}</div>

        <div className="mt-6 space-y-6">
          <CreateUserForm roleOptions={roleOptions} onSubmit={onCreate} submitting={submitting} />

          <UsersTable
            users={users}
            loading={loading}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(p, ps) => load(p, ps)}
            onDeleteClick={(user) => setDeleteTarget(user)}
          />
        </div>

        <Modal
          title={t("users.deleteTitle")}
          open={!!deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onOk={onDelete}
          okText={t("users.deleteOk")}
          cancelText={t("users.deleteCancel")}
          confirmLoading={deletingId === deleteTarget?.id}
        >
          <div className="text-sm text-gray-600">{deleteTarget?.name}</div>
          <div className="text-sm">{t("users.deleteConfirm")}</div>
        </Modal>
      </AppLayout>
    </AuthGuard>
  )
}
