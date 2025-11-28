// API configuration for backend integration
// 로컬 FastAPI 백엔드: http://localhost:8000

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
}

// API endpoints matching backend DB structure
export const API_ENDPOINTS = {
  // Auth & User
  CREATE_USER: "/users",
  GET_USER: "/users/:id",
  UPDATE_USER: "/users/:id",

  // Regions
  GET_REGIONS: "/regions",
  GET_REGION_BY_NAME: "/regions/search",

  // Examples (정책 사례)
  GET_EXAMPLES: "/examples",
  GET_EXAMPLE_BY_ID: "/examples/:id",
  CREATE_EXAMPLE: "/examples",
  UPDATE_EXAMPLE: "/examples/:id",
  DELETE_EXAMPLE: "/examples/:id",
  LIKE_EXAMPLE: "/examples/:id/like",
  BOOKMARK_EXAMPLE: "/examples/:id/bookmark",
  GET_EXAMPLE_COMMENTS: "/examples/:id/comments",
  CREATE_EXAMPLE_COMMENT: "/examples/:id/comments",

  // Proposals (정책 제안)
  GET_PROPOSALS: "/proposals",
  GET_PROPOSAL_BY_ID: "/proposals/:id",
  CREATE_PROPOSAL: "/proposals",
  LIKE_PROPOSAL: "/proposals/:id/like",
  BOOKMARK_PROPOSAL: "/proposals/:id/bookmark",
  GET_PROPOSAL_COMMENTS: "/proposals/:id/comments",
  CREATE_PROPOSAL_COMMENT: "/proposals/:id/comments",

  // Guidelines
  CREATE_GUIDELINE: "/guidelines",

  // Tags
  GET_TAGS: "/tags",
  GET_TAGS_BY_CATEGORY: "/tags/:category",
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean // 인증 필요 여부 (기본: false)
}

export async function apiFetch<T = unknown>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = false, headers: customHeaders, ...restOptions } = options
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  }

  if (auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (token) {
      headers["Authorization"] = token
    }
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers,
  }

  if (body) {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error ${response.status}: ${errorText}`)
  }

  // 204 No Content 등 빈 응답 처리
  const contentType = response.headers.get("content-type")
  if (contentType && contentType.includes("application/json")) {
    return response.json()
  }

  return null as T
}

export async function fetchRegionId(regionName: string): Promise<number | null> {
  try {
    const data = await apiFetch<Array<{ id: number; full_name: string; display_name: string }>>(
      `/regions?q=${encodeURIComponent(regionName)}&page=1`,
    )

    if (!Array.isArray(data) || data.length === 0) {
      return null
    }

    const exactMatch = data.find((item) => item.display_name === regionName)
    if (exactMatch) {
      return exactMatch.id
    }

    return data[0].id
  } catch (error) {
    console.error("[v0] fetchRegionId error:", error)
    return null
  }
}

export async function createGuideline(data: {
  title: string
  rid: number
  categories: string[]
  problem: string
}) {
  return apiFetch("/guidelines", {
    method: "POST",
    body: data,
    auth: true,
  })
}

// 기존 apiRequest 유지 (하위 호환성)
export async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    return response
  } catch (error) {
    console.error("[v0] API request failed:", error)
    throw error
  }
}

// Helper to replace :id with actual id
export function buildEndpoint(endpoint: string, params: Record<string, string | number>): string {
  let built = endpoint
  Object.keys(params).forEach((key) => {
    built = built.replace(`:${key}`, String(params[key]))
  })
  return built
}
