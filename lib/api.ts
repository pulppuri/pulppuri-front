// API configuration for future backend integration
// TODO: 백엔드 서버 준비되면 실제 IP와 포트로 교체하세요

export const API_CONFIG = {
  // Development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",

  // Production - 나중에 실제 서버 주소로 변경
  // BASE_URL: 'https://your-server-domain.com:port/api',
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

  // Tags
  GET_TAGS: "/tags",
  GET_TAGS_BY_CATEGORY: "/tags/:category",
}

// API helper functions
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
