"use client"

import { Modal, InputNumber } from "antd"
import { useTranslations } from "next-intl"
import type { Book } from "@/services/book"

type Props = {
  open: boolean
  book: Book | null
  quantity: number
  onQuantityChange: (value: number) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteBookModal({
  open,
  book,
  quantity,
  onQuantityChange,
  onConfirm,
  onCancel
}: Props) {
  const t = useTranslations("books")

  return (
    <Modal
      title={t("deleteTitle")}
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={t("deleteOk")}
      cancelText={t("deleteCancel")}
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-600">{book?.title}</div>
        <div className="text-sm">{t("deleteConfirm")}</div>
        <div className="text-xs text-gray-500">
          {t("fields.totalQty")}: {book?.totalQty} | {t("columns.available")}: {book?.availableQty}
        </div>
        <InputNumber
          min={1}
          max={book?.availableQty ?? 1}
          value={quantity}
          onChange={(v) => onQuantityChange(Number(v))}
          className="w-full"
        />
      </div>
    </Modal>
  )
}
