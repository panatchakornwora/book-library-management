import api from "./api"

export type Book = {
  id: string
  title: string
  author: string
  isbn: string
  publicationYear?: number | null
  coverUrl?: string | null
  availableQty: number
  totalQty: number
}

export async function getBooks(params: {
  query?: string
  page?: number
  pageSize?: number
}): Promise<{ items: Book[]; total: number; page: number; pageSize: number }> {
  const res = await api.get("/books", { params })
  return res.data as { items: Book[]; total: number; page: number; pageSize: number }
}

export async function createBook(payload: {
  title: string
  author: string
  isbn: string
  publicationYear?: number
  coverUrl?: string
  totalQty: number
}) {
  const res = await api.post("/books", payload)
  return res.data as Book
}

export async function updateBook(
  id: string,
  payload: {
    title?: string
    author?: string
    isbn?: string
    publicationYear?: number
    coverUrl?: string
    totalQty?: number
  }
) {
  const res = await api.put(`/books/${id}`, payload)
  return res.data as Book
}

export async function deleteBook(id: string) {
  await api.delete(`/books/${id}`)
}

export async function deleteBookQuantity(id: string, quantity: number) {
  const res = await api.patch(`/books/${id}/quantity`, { quantity })
  return res.data as Book
}

export type MostBorrowedItem = { book: Book; borrowCount: number }

export async function getMostBorrowedBooks(limit = 5): Promise<{ items: MostBorrowedItem[] }> {
  const res = await api.get("/books/most-borrowed", { params: { limit } })
  return res.data as { items: MostBorrowedItem[] }
}

export async function uploadBookCover(file: File): Promise<{ url: string }> {
  const form = new FormData()
  form.append("file", file)
  const res = await api.post("/books/cover", form, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return res.data as { url: string }
}
