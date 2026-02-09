"use client"

import { Table, Input, Button, Space, message, Tag } from "antd"
import { InfoCircleOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import AppLayout from "@/components/layout/AppLayout"
import AuthGuard from "@/components/auth/AuthGuard"
import {
  createBook,
  deleteBookQuantity,
  getBooks,
  getMostBorrowedBooks,
  updateBook,
  type Book,
  type MostBorrowedItem
} from "@/services/book"
import { getUserFromToken } from "@/services/session"
import { borrowBook, returnBook, listMyLoans } from "@/services/loan"
import BookDetailsModal from "@/components/books/bookDetailsModal"
import BookFormModal from "@/components/books/bookFormModal"
import DeleteBookModal from "@/components/books/deleteBookModal"
import BorrowModal from "@/components/books/borrowModal"
import ReturnModal from "@/components/books/returnModal"
import MostBorrowedTable from "@/components/books/mostBorrowedTable"
import type { BookFormValues } from "@/components/books/types"

export default function BooksPage() {
  const t = useTranslations("books")
  const [books, setBooks] = useState<Book[]>([])
  const [q, setQ] = useState("")
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [submitting, setSubmitting] = useState(false)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const currentUser = useMemo(() => getUserFromToken(), [])
  const canCreate = currentUser?.role === "ADMIN" || currentUser?.role === "LIBRARIAN"
  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "LIBRARIAN"
  const [selected, setSelected] = useState<Book | null>(null)
  const [editing, setEditing] = useState<Book | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [deleteQty, setDeleteQty] = useState<number>(1)
  const [borrowBookItem, setBorrowBookItem] = useState<Book | null>(null)
  const [returnBookItem, setReturnBookItem] = useState<Book | null>(null)
  const [borrowAt, setBorrowAt] = useState<string | undefined>(undefined)
  const [dueAt, setDueAt] = useState<string | undefined>(undefined)
  const [, setReturnAt] = useState<string | undefined>(undefined)
  const [activeLoanBookIds, setActiveLoanBookIds] = useState<Set<string>>(new Set())
  const [mostBorrowed, setMostBorrowed] = useState<MostBorrowedItem[]>([])
  const [mostBorrowedLoading, setMostBorrowedLoading] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const load = useCallback(
    async (query = q, p = page, ps = pageSize) => {
      const data = await getBooks({ query, page: p, pageSize: ps })
      setBooks(data.items)
      setTotal(data.total)
      setPage(data.page)
      setPageSize(data.pageSize)
      const loans = await listMyLoans()
      setActiveLoanBookIds(new Set(loans.map((l) => l.bookId)))
    },
    [q, page, pageSize]
  )

  const loadMostBorrowed = useCallback(async () => {
    if (!canManage) return
    setMostBorrowedLoading(true)
    try {
      const data = await getMostBorrowedBooks(5)
      setMostBorrowed(data.items)
    } finally {
      setMostBorrowedLoading(false)
    }
  }, [canManage])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadMostBorrowed()
  }, [mounted, loadMostBorrowed])

  useEffect(() => {
    const id = setTimeout(() => {
      load(q, 1, pageSize)
    }, 400)
    return () => clearTimeout(id)
  }, [q, pageSize, load])

  const onCreate = async (values: BookFormValues) => {
    setSubmitting(true)
    try {
      await createBook(values)
      setCoverPreview(null)
      setCreating(false)
      await load(q, page, pageSize)
      await loadMostBorrowed()
    } finally {
      setSubmitting(false)
    }
  }

  const onEdit = async (values: BookFormValues) => {
    if (!editing) return
    setSubmitting(true)
    try {
      if (!values.coverUrl && editing.coverUrl) {
        values = { ...values, coverUrl: editing.coverUrl }
      }
      await updateBook(editing.id, values)
      setEditing(null)
      setEditCoverPreview(null)
      await load(q, page, pageSize)
      await loadMostBorrowed()
      messageApi.success(t("editSuccess"))
    } catch {
      messageApi.error(t("editFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = (book: Book) => {
    setDeleteTarget(book)
    setDeleteQty(1)
  }

  const onBorrow = async () => {
    if (!borrowBookItem) return
    try {
      const borrowedAt = borrowAt ?? new Date().toISOString()
      await borrowBook(borrowBookItem.id, borrowedAt, dueAt)
      setBorrowBookItem(null)
      setBorrowAt(undefined)
      setDueAt(undefined)
      await load(q, page, pageSize)
      await loadMostBorrowed()
      messageApi.success(t("borrowSuccess"))
    } catch {
      messageApi.error(t("borrowFailed"))
    }
  }

  const onReturn = async () => {
    if (!returnBookItem) return
    try {
      await returnBook(returnBookItem.id, new Date().toISOString())
      setReturnBookItem(null)
      setReturnAt(undefined)
      await load(q, page, pageSize)
      await loadMostBorrowed()
      messageApi.success(t("returnSuccess"))
    } catch {
      messageApi.error(t("returnFailed"))
    }
  }

  return (
    <AuthGuard>
      <AppLayout>
        {contextHolder}
        <div className="mb-4 flex flex-col gap-3">
          <div className="text-2xl font-semibold">{t("title")}</div>
          <div className="flex gap-2 md:items-center">
            <Input
              placeholder={t("searchPlaceholder")}
              value={q}
              onChange={(e) => {
                const v = e.target.value
                setQ(v)
              }}
              allowClear
            />
            {mounted && canCreate ? (
              <Button type="primary" onClick={() => setCreating(true)}>
                {t("createAction")}
              </Button>
            ) : null}
          </div>
        </div>

        {mounted && canManage ? (
          <MostBorrowedTable items={mostBorrowed} loading={mostBorrowedLoading} />
        ) : null}

        <Table
          rowKey="id"
          dataSource={books}
          columns={[
            {
              title: t("columns.title"),
              dataIndex: "title",
              render: (value, r) => (
                <div className="flex items-center gap-2">
                  <span>{value}</span>
                  {activeLoanBookIds.has(r.id) ? <Tag color="gold">{t("borrowed")}</Tag> : null}
                </div>
              )
            },
            { title: t("columns.author"), dataIndex: "author" },
            { title: t("columns.available"), dataIndex: "availableQty" },
            {
              title: t("columns.action"),
              render: (_, r) => (
                <Space>
                  <Button
                    type="primary"
                    disabled={r.availableQty <= 0}
                    onClick={() => {
                      setBorrowBookItem(r)
                      setBorrowAt(new Date().toISOString())
                      setDueAt(undefined)
                    }}
                  >
                    {t("borrow")}
                  </Button>
                  <Button
                    onClick={() => {
                      setReturnBookItem(r)
                      setReturnAt(new Date().toISOString())
                    }}
                    disabled={!activeLoanBookIds.has(r.id)}
                  >
                    {t("return")}
                  </Button>
                  {canManage ? (
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditing(r)
                        setEditCoverPreview(r.coverUrl ?? null)
                      }}
                    />
                  ) : null}
                  {canManage ? (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(r)}
                    />
                  ) : null}
                </Space>
              )
            },
            {
              title: "",
              render: (_, r) => (
                <Button type="text" icon={<InfoCircleOutlined />} onClick={() => setSelected(r)}>
                  {t("columns.viewAction")}
                </Button>
              )
            }
          ]}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (tot) => `${t("total")}: ${tot}`,
            onChange: (p, ps) => load(q, p, ps)
          }}
          scroll={{ x: true }}
        />

        <BookDetailsModal book={selected} onClose={() => setSelected(null)} />

        <BorrowModal
          book={borrowBookItem}
          borrowedAt={borrowAt}
          dueAt={dueAt}
          onDueChange={setDueAt}
          onConfirm={onBorrow}
          onCancel={() => setBorrowBookItem(null)}
        />

        <ReturnModal
          book={returnBookItem}
          onConfirm={onReturn}
          onCancel={() => setReturnBookItem(null)}
        />

        <BookFormModal
          open={!!editing}
          title={t("editTitle")}
          okText={t("editAction")}
          confirmLoading={submitting}
          initialValues={
            editing
              ? {
                  title: editing.title,
                  author: editing.author,
                  isbn: editing.isbn,
                  publicationYear: editing.publicationYear ?? undefined,
                  coverUrl: editing.coverUrl ?? undefined,
                  totalQty: editing.totalQty
                }
              : undefined
          }
          onSubmit={onEdit}
          onCancel={() => setEditing(null)}
          previewUrl={editCoverPreview}
          onPreviewChange={setEditCoverPreview}
        />

        <BookFormModal
          open={creating}
          title={t("createTitle")}
          okText={t("createAction")}
          confirmLoading={submitting}
          initialValues={{ totalQty: 1 }}
          onSubmit={onCreate}
          onCancel={() => setCreating(false)}
          previewUrl={coverPreview}
          onPreviewChange={setCoverPreview}
        />

        <DeleteBookModal
          open={!!deleteTarget}
          book={deleteTarget}
          quantity={deleteQty}
          onQuantityChange={setDeleteQty}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (!deleteTarget) return
            try {
              await deleteBookQuantity(deleteTarget.id, deleteQty)
              setDeleteTarget(null)
              await load(q, page, pageSize)
              messageApi.success(t("deleteSuccess"))
            } catch {
              messageApi.error(t("deleteFailed"))
            }
          }}
        />
      </AppLayout>
    </AuthGuard>
  )
}
