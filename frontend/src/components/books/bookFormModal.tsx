"use client"

import { Modal, Form, Input, InputNumber } from "antd"
import { useEffect } from "react"
import { useTranslations } from "next-intl"
import CoverUpload from "./coverUpload"
import type { BookFormValues } from "./types"

type Props = {
  open: boolean
  title: string
  okText: string
  confirmLoading?: boolean
  initialValues?: Partial<BookFormValues>
  onSubmit: (values: BookFormValues) => void
  onCancel: () => void
  previewUrl: string | null
  onPreviewChange: (url: string | null) => void
}

export default function BookFormModal({
  open,
  title,
  okText,
  confirmLoading,
  initialValues,
  onSubmit,
  onCancel,
  previewUrl,
  onPreviewChange
}: Props) {
  const t = useTranslations("books")
  const [form] = Form.useForm<BookFormValues>()
  const coverUrl = Form.useWatch("coverUrl", form)

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [form, initialValues])

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText={okText}
      confirmLoading={confirmLoading}
      destroyOnHidden
    >
      <Form<BookFormValues>
        layout="vertical"
        form={form}
        onFinish={onSubmit}
        initialValues={initialValues}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label={t("fields.title")}
            name="title"
            rules={[{ required: true, message: t("validate.title") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("fields.author")}
            name="author"
            rules={[{ required: true, message: t("validate.author") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("fields.isbn")}
            name="isbn"
            rules={[{ required: true, message: t("validate.isbn") }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("fields.totalQty")}
            name="totalQty"
            rules={[{ required: true, message: t("validate.totalQty") }]}
          >
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <Form.Item label={t("fields.publicationYear")} name="publicationYear">
            <InputNumber className="w-full" min={0} />
          </Form.Item>

          <Form.Item label={t("fields.coverUrl")} name="coverUrl">
            <CoverUpload
              value={coverUrl}
              onChange={(url) => form.setFieldValue("coverUrl", url)}
              previewUrl={previewUrl}
              onPreviewChange={onPreviewChange}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}
