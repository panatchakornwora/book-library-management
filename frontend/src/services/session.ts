const TOKEN_KEY = "token"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function clearSession() {
  clearToken()
}

export function isAuthed() {
  return !!getToken()
}

type JwtPayload = {
  name?: string
  email?: string
  role?: string
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function getUserFromToken(): { name?: string; email?: string; role?: string } | null {
  const token = getToken()
  if (!token) return null
  return decodeJwtPayload(token)
}
