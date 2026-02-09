"use client"

import { Button, Form, Input, Select } from "antd"
import { useTranslations } from "next-intl"
import type { UserItem } from "@/services/user"

export type FormValues = {
  name: string
  email: string
  password: string
  role: UserItem["role"]
}

type Props = {
  roleOptions: Array<{ value: UserItem["role"]; label: string }>
  onSubmit: (values: FormValues) => void
  submitting: boolean
}

export default function CreateUserForm({ roleOptions, onSubmit, submitting }: Props) {
  const t = useTranslations()
  const [form] = Form.useForm<FormValues>()

  const handleFinish = async (values: FormValues) => {
    await onSubmit(values)
    form.resetFields()
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-lg font-semibold mb-3">{t("users.createTitle")}</div>
      <Form<FormValues>
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{ role: "MEMBER" }}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item
            label={t("users.name")}
            name="name"
            rules={[{ required: true, message: t("users.nameRequired") }]}
          >
            <Input placeholder={t("users.namePlaceholder")} />
          </Form.Item>

          <Form.Item
            label={t("users.email")}
            name="email"
            rules={[
              { required: true, message: t("users.emailRequired") },
              { type: "email", message: t("users.emailInvalid") }
            ]}
          >
            <Input placeholder="member@test.com" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label={t("users.password")}
            name="password"
            rules={[
              { required: true, message: t("users.passwordRequired") },
              { min: 10, message: t("users.passwordMin") }
            ]}
          >
            <Input.Password placeholder="••••••••" autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label={t("users.role")}
            name="role"
            rules={[{ required: true, message: t("users.roleRequired") }]}
          >
            <Select options={roleOptions} />
          </Form.Item>
        </div>

        <div className="mt-2 flex justify-end">
          <Button type="primary" htmlType="submit" loading={submitting}>
            {t("users.createAction")}
          </Button>
        </div>
      </Form>
    </div>
  )
}
