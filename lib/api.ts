// API configuration for future backend integration
// TODO: 백엔드 서버 준비되면 실제 IP와 포트로 교체하세요

export const API_CONFIG = {
  // Development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",

  // Production - 나중에 실제 서버 주소로 변경
  // BASE_URL: 'https://your-server-domain.com:port/api',
}

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  LOGOUT: "/auth/logout",

  // Policies
  GET_POLICIES: "/policies",
  GET_POLICY_BY_ID: "/policies/:id",
  CREATE_POLICY: "/policies",
  LIKE_POLICY: "/policies/:id/like",
  BOOKMARK_POLICY: "/policies/:id/bookmark",

  // Comments
  GET_COMMENTS: "/policies/:id/comments",
  CREATE_COMMENT: "/policies/:id/comments",

  // User
  GET_USER_PROFILE: "/user/profile",
  UPDATE_USER_PROFILE: "/user/profile",
  GET_USER_POSTS: "/user/posts",
  GET_USER_PROPOSALS: "/user/proposals",
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
