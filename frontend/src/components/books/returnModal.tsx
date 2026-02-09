"use client"

import { Modal } from "antd"
import { useTranslations } from "next-intl"
import type { Book } from "@/services/book"

type Props = {
  book: Book | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ReturnModal({ book, onConfirm, onCancel }: Props) {
  const t = useTranslations("books")

  return (
    <Modal
      title={t("returnTitle")}
      open={!!book}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={t("return")}
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-600">{book?.title}</div>
        <div className="text-sm">{t("returnConfirm")}</div>
      </div>
    </Modal>
  )
}
