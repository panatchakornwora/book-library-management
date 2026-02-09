"use client"

import { ReactNode, useEffect, useState } from "react"
import { Button, Drawer, Menu, Segmented } from "antd"
import { MenuOutlined, TeamOutlined, HomeOutlined, HistoryOutlined } from "@ant-design/icons"
import { useTranslations } from "next-intl"
import { usePathname, useRouter, useParams } from "next/navigation"
import { clearSession, getUserFromToken } from "@/services/session"
import { logout } from "@/services/auth"

export default function AppLayout({ children }: { children: ReactNode }) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const locale = params.locale as string
  const [user, setUser] = useState<ReturnType<typeof getUserFromToken>>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setUser(getUserFromToken())
  }, [])

  const menuItems = [
    {
      key: "home",
      label: t("nav.home"),
      icon: <HomeOutlined />,
      href: `/${locale}/book`
    },
    {
      key: "loans",
      label: t("nav.loanHistory"),
      icon: <HistoryOutlined />,
      href: `/${locale}/loans`
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            key: "people",
            label: t("nav.managePeople"),
            icon: <TeamOutlined />,
            href: `/${locale}/users`
          }
        ]
      : [])
  ]

  const selectedKey = pathname?.includes("/users")
    ? "people"
    : pathname?.includes("/loans")
      ? "loans"
      : "home"

  const onLogout = async () => {
    try {
      await logout()
    } finally {
      clearSession()
      router.push(`/${locale}/login`)
    }
  }

  const goToLocale = (nextLocale: string) => {
    const current = pathname || "/"
    let next = current
    if (/^\/(th|en)(\/|$)/.test(current)) {
      next = current.replace(/^\/(th|en)(?=\/|$)/, `/${nextLocale}`)
    } else {
      const suffix = current.startsWith("/") ? current : `/${current}`
      next = `/${nextLocale}${suffix}`
    }
    router.push(next)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-14 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            type="text"
            aria-label="Open menu"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
          />
          <button
            type="button"
            className="font-semibold text-lg text-gray-900"
            onClick={() => router.push(`/${locale}/book`)}
          >
            {t("app.name")}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="text-sm text-gray-900 hidden sm:block">
              {t("nav.userLabel")} : {user.name} · {user.role}
            </div>
          ) : null}
          <div className="hidden sm:block">
            <Segmented
              size="small"
              value={locale}
              onChange={(val) => goToLocale(val as string)}
              options={[
                { label: "TH", value: "th" },
                { label: "EN", value: "en" }
              ]}
            />
          </div>
          <Button onClick={onLogout}>{t("nav.logout")}</Button>
        </div>
      </div>
      {user ? (
        <div className="sm:hidden px-6 py-2 bg-white border-b text-sm text-gray-900 flex items-center justify-between">
          <div>
            {t("nav.userLabel")} : {user.name} · {user.role}
          </div>
          <Segmented
            size="small"
            value={locale}
            onChange={(val) => goToLocale(val as string)}
            options={[
              { label: "TH", value: "th" },
              { label: "EN", value: "en" }
            ]}
          />
        </div>
      ) : null}
      <Drawer
        title={t("app.name")}
        placement="left"
        onClose={() => setOpen(false)}
        open={open}
        size="default"
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ borderInlineEnd: "none" }}
          onClick={(info) => {
            const item = menuItems.find((m) => m.key === info.key)
            if (item) {
              setOpen(false)
              router.push(item.href)
            }
          }}
        />
      </Drawer>
      <div className="p-6">{children}</div>
    </div>
  )
}
