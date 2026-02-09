import api from "./api"

export async function borrowBook(bookId: string, borrowedAt?: string, dueDate?: string) {
  const res = await api.post(`/loans/borrow/${bookId}`, {
    borrowedAt,
    dueDate
  })
  return res.data as { id: string }
}

export async function returnBook(bookId: string, returnedAt?: string) {
  const res = await api.post(`/loans/return/book/${bookId}`, {
    returnedAt
  })
  return res.data as { ok: boolean }
}

export async function listMyLoans() {
  const res = await api.get("/loans/my")
  return res.data as { id: string; bookId: string; borrowedAt: string; returnedAt: string | null }[]
}

export async function listLoanHistory(page = 1, pageSize = 20) {
  const res = await api.get("/loans/history", { params: { page, pageSize } })
  return res.data as {
    items: {
      id: string
      borrowedAt: string
      dueDate: string | null
      returnedAt: string | null
      user: { id: string; name: string; email: string; role: string }
      book: { id: string; title: string; author: string }
    }[]
    total: number
    page: number
    pageSize: number
  }
}

export async function listMyLoanHistory(page = 1, pageSize = 20) {
  const res = await api.get("/loans/my-history", { params: { page, pageSize } })
  return res.data as {
    items: {
      id: string
      borrowedAt: string
      dueDate: string | null
      returnedAt: string | null
      user: { id: string; name: string; email: string; role: string }
      book: { id: string; title: string; author: string }
    }[]
    total: number
    page: number
    pageSize: number
  }
}
