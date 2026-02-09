"use client"

import { Modal, Image } from "antd"
import { useTranslations } from "next-intl"
import type { Book } from "@/services/book"

type Props = {
  book: Book | null
  onClose: () => void
}

const normalizeCoverUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url
  }
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const clean = url.startsWith("/") ? url : `/${url}`
  return `${base}${clean}`
}

export default function BookDetailsModal({ book, onClose }: Props) {
  const t = useTranslations("books")
  return (
    <Modal title={t("detailsTitle")} open={!!book} onCancel={onClose} footer={null}>
      {book ? (
        <div className="space-y-4">
          {book.coverUrl ? (
            <Image
              src={normalizeCoverUrl(book.coverUrl) ?? undefined}
              alt={book.title}
              width="100%"
            />
          ) : null}
          <div className="text-xl font-semibold">{book.title}</div>
          <div className="text-gray-600">{book.author}</div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="text-gray-500">{t("fields.isbn")}:</span> {book.isbn}
            </div>
            <div>
              <span className="text-gray-500">{t("fields.publicationYear")}:</span>{" "}
              {book.publicationYear ?? "-"}
            </div>
            <div>
              <span className="text-gray-500">{t("fields.totalQty")}:</span> {book.totalQty}
            </div>
            <div>
              <span className="text-gray-500">{t("columns.available")}:</span> {book.availableQty}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
