"use client"

import { Button, Form, Input } from "antd"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { login } from "@/services/auth"
import { setToken } from "@/services/session"

type LoginValues = { email: string; password: string }

function normalizeApiMessages(data: unknown): string[] {
  if (!data || typeof data !== "object") return []
  const msg = (data as { message?: unknown }).message
  if (Array.isArray(msg)) return msg.filter((x): x is string => typeof x === "string")
  if (typeof msg === "string") return [msg]
  return []
}

function mapFieldErrors(messages: string[]) {
  const fields: Array<{ name: keyof LoginValues; errors: string[] }> = []

  const emailErr = messages.find((m) => m.toLowerCase().includes("email"))
  const passErr = messages.find((m) => m.toLowerCase().includes("password"))

  if (emailErr) fields.push({ name: "email", errors: [emailErr] })
  if (passErr) fields.push({ name: "password", errors: [passErr] })

  return fields
}

export default function LoginPage() {
  const t = useTranslations()
  const [form] = Form.useForm<LoginValues>()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await login(values.email, values.password)
      setToken(res.accessToken)
      router.push(`/${locale}/book`)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: unknown } })?.response?.status
      const data = (err as { response?: { data?: unknown } })?.response?.data

      if (status === 400) {
        const msgs = normalizeApiMessages(data)
        const fieldErrors = mapFieldErrors(msgs)
        if (fieldErrors.length) {
          form.setFields(fieldErrors)
          return
        }
        setFormError(t("auth.loginFailed"))
        return
      }

      if (status === 404) {
        form.setFields([{ name: "email", errors: [t("auth.userNotFound")] }])
        return
      }
      if (status === 401) {
        form.setFields([{ name: "password", errors: [t("auth.invalidCredentials")] }])
        return
      }

      setFormError(t("auth.loginFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Form<LoginValues>
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => {
          setFormError(t("auth.loginFailed"))
        }}
        onFieldsChange={(changed) => {
          changed.forEach((f) => {
            if (f.errors?.length) form.setFields([{ name: f.name, errors: [] }])
          })
        }}
        className="bg-white rounded-xl shadow w-full max-w-sm login-form-padding"
      >
        <div className="mb-6">
          <div className="text-2xl font-semibold">{t("app.name")}</div>
          <div className="text-gray-900! text-lg mt-2">{t("auth.login")}</div>
        </div>

        <Form.Item
          label={t("auth.email")}
          name="email"
          hasFeedback
          rules={[
            { required: true, message: t("auth.emailRequired") },
            { type: "email", message: t("auth.emailInvalid") }
          ]}
        >
          <Input autoComplete="email" placeholder="admin@demo.com" />
        </Form.Item>

        <Form.Item
          label={t("auth.password")}
          name="password"
          hasFeedback
          rules={[
            { required: true, message: t("auth.passwordRequired") },
            { min: 10, message: t("auth.passwordMin") }
          ]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>

        {formError ? <div className="text-red-600 text-sm mb-3">{formError}</div> : null}

        <Button type="primary" htmlType="submit" block loading={submitting}>
          {t("auth.login")}
        </Button>
      </Form>
    </div>
  )
}
