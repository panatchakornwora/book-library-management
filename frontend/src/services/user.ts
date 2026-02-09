import api from "./api"

export type UserItem = {
  id: string
  name: string
  email: string
  role: "ADMIN" | "LIBRARIAN" | "MEMBER"
}

export async function listUsers(page = 1, pageSize = 20) {
  const res = await api.get("/user/list", { params: { page, pageSize } })
  return res.data as {
    items: UserItem[]
    total: number
    page: number
    pageSize: number
  }
}

export async function createUser(payload: {
  name: string
  email: string
  password: string
  role: UserItem["role"]
}) {
  const res = await api.post("/user", payload)
  return res.data as UserItem
}

export async function deleteUser(id: string) {
  await api.delete(`/user/${id}`)
}
