"use client"

import { Modal, DatePicker } from "antd"
import dayjs from "dayjs"
import { useTranslations } from "next-intl"
import type { Book } from "@/services/book"

type Props = {
  book: Book | null
  borrowedAt?: string
  dueAt?: string
  onDueChange: (iso?: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function BorrowModal({
  book,
  borrowedAt,
  dueAt,
  onDueChange,
  onConfirm,
  onCancel
}: Props) {
  const t = useTranslations("books")

  return (
    <Modal
      title={t("borrowTitle")}
      open={!!book}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={t("borrow")}
      okButtonProps={{ disabled: !dueAt }}
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-600">{book?.title}</div>
        <div className="text-xs text-gray-500">
          {t("currentDateTime")}: {borrowedAt ? dayjs(borrowedAt).format("YYYY-MM-DD HH:mm") : "-"}
        </div>
        <div className="text-xs text-gray-500">{t("dueDate")}</div>
        <DatePicker
          showTime
          className="w-full"
          value={dueAt ? dayjs(dueAt) : undefined}
          disabledDate={(current) => !!current && current < dayjs().startOf("day")}
          disabledTime={(current) => {
            if (!current) return {}
            const now = dayjs()
            if (!current.isSame(now, "day")) return {}
            return {
              disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
              disabledMinutes: (hour) =>
                hour === now.hour() ? Array.from({ length: now.minute() }, (_, i) => i) : []
            }
          }}
          onChange={(v) => onDueChange(v ? v.toDate().toISOString() : undefined)}
        />
      </div>
    </Modal>
  )
}
