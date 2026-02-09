"use client"

import { Upload, Input, message } from "antd"
import { useEffect } from "react"
import Image from "next/image"
import type { UploadProps } from "antd"
import { useTranslations } from "next-intl"
import { uploadBookCover } from "@/services/book"

type CoverUploadProps = {
  value?: string
  onChange?: (url?: string) => void
  previewUrl: string | null
  onPreviewChange: (url: string | null) => void
}

const MAX_SIZE_MB = 5

export const normalizeCoverUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url
  }
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const clean = url.startsWith("/") ? url : `/${url}`
  return `${base}${clean}`
}

const updatePreviewUrl = (
  nextUrl: string | null,
  onPreviewChange: (url: string | null) => void,
  current?: string | null
) => {
  if (current && current.startsWith("blob:")) {
    URL.revokeObjectURL(current)
  }
  onPreviewChange(nextUrl)
}

const previewFromFile = (
  file: File,
  onPreviewChange: (url: string | null) => void,
  current?: string | null
) => {
  const blobUrl = URL.createObjectURL(file)
  updatePreviewUrl(blobUrl, onPreviewChange, current)
}

export default function CoverUpload({
  value,
  onChange,
  previewUrl,
  onPreviewChange
}: CoverUploadProps) {
  const t = useTranslations("books")
  const [messageApi, contextHolder] = message.useMessage()

  useEffect(() => {
    if (!value) {
      updatePreviewUrl(null, onPreviewChange, previewUrl)
      return
    }
    const normalized = normalizeCoverUrl(value)
    if (normalized && normalized !== previewUrl) {
      updatePreviewUrl(normalized, onPreviewChange, previewUrl)
    }
  }, [value, onPreviewChange, previewUrl])

  const handleUpload: UploadProps["customRequest"] = async (options) => {
    if (!options) return
    try {
      const res = await uploadBookCover(options.file as File)
      const nextUrl = normalizeCoverUrl(res.url)
      onChange?.(res.url)
      updatePreviewUrl(nextUrl, onPreviewChange, previewUrl)
      options.onSuccess?.(res)
      messageApi.success(t("uploadSuccess"))
    } catch (err) {
      options.onError?.(err as any)
      messageApi.error(t("uploadFailed"))
    }
  }

  const handleChange = (file?: File) => {
    if (!file) return
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      messageApi.error(t("uploadTooLarge"))
      return
    }
    previewFromFile(file, onPreviewChange, previewUrl)
  }

  return (
    <>
      {contextHolder}
      <Input type="hidden" value={value} />
      <Upload
        accept="image/*"
        listType="picture-card"
        maxCount={1}
        customRequest={handleUpload}
        onChange={(info) => handleChange(info.file?.originFileObj as File | undefined)}
        onRemove={() => {
          onChange?.(undefined)
          updatePreviewUrl(null, onPreviewChange, previewUrl)
        }}
        showUploadList={false}
      >
        {previewUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={previewUrl}
              alt="cover"
              fill
              sizes="100px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500">{t("upload")}</div>
        )}
      </Upload>
    </>
  )
}
