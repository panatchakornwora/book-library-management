import api from "./api"

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password })
  return res.data as {
    accessToken: string
    user: { id: string; email: string; role: string }
  }
}

export async function logout() {
  const res = await api.post("/auth/logout")
  return res.data as { message: string }
}

export async function refresh() {
  const res = await api.post("/auth/refresh")
  return res.data as { accessToken: string }
}
