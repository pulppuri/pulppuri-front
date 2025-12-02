// API configuration for backend integration
// 로컬 FastAPI 백엔드: http://localhost:8000

import type {
  RegionItem,
  ExampleSummary,
  GuidelinesResponse,
  ExampleDetail,
  ProposalSummary,
  ProposalDetail,
  CreateProposalDto,
  ReviseProposalInput,
  ReviseProposalOutput,
} from "@/types"

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
}

// ============================================================
// 현재 구현된 엔드포인트 (FastAPI main.py 기준)
// ============================================================
export const API_ENDPOINTS = {
  // Auth & User
  CREATE_USER: "/users", // POST: { nickname, age, gender, job, rid } → { token }

  // Regions
  GET_REGIONS: "/regions", // GET: ?q=&page= → RegionItem[]

  // Examples (정책 사례)
  GET_EXAMPLES: "/examples", // GET: ?q=&page= → { examples: ExampleSummary[] }
  // CHANGE: 함수형 엔드포인트 추가: GET /examples/{id}
  GET_EXAMPLE_DETAIL: (id: number | string) => `/examples/${id}`,
  GET_EXAMPLE: (eid: number | string) => `/examples/${eid}`,

  // Guidelines
  CREATE_GUIDELINE: "/guidelines", // POST: { title, rid, categories, problem } → GuidelinesResponse

  // Proposals (정책 제안)
  GET_PROPOSALS: "/proposals", // GET: ?q=&page= → { proposals: ProposalSummary[] }
  // CHANGE: 함수형 엔드포인트 추가: GET /proposals/{id}
  GET_PROPOSAL_DETAIL: (id: number | string) => `/proposals/${id}`,
  GET_PROPOSAL: (pid: number | string) => `/proposals/${pid}`,
  POST_PROPOSAL: "/proposals",
}

// ============================================================
// 미구현 엔드포인트 (향후 백엔드 추가 시 사용)
// ============================================================
export const API_ENDPOINTS_NOT_IMPLEMENTED = {
  // User
  GET_USER: "/users/:id",
  UPDATE_USER: "/users/:id",

  // Regions
  GET_REGION_BY_NAME: "/regions/search",

  // Examples
  GET_EXAMPLE_BY_ID: "/examples/:id",
  CREATE_EXAMPLE: "/examples",
  UPDATE_EXAMPLE: "/examples/:id",
  DELETE_EXAMPLE: "/examples/:id",
  LIKE_EXAMPLE: "/examples/:id/like",
  BOOKMARK_EXAMPLE: "/examples/:id/bookmark",
  GET_EXAMPLE_COMMENTS: "/examples/:id/comments",
  CREATE_EXAMPLE_COMMENT: "/examples/:id/comments",

  // Proposals
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

// ============================================================
// Query String 헬퍼
// ============================================================
export function withQuery(endpoint: string, queryObj: Record<string, string | number | boolean | undefined>): string {
  const params = new URLSearchParams()
  Object.entries(queryObj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value))
    }
  })
  const queryString = params.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}

// ============================================================
// apiFetch - 메인 API 호출 함수
// ============================================================
interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  auth?: boolean // 인증 필요 여부 (기본: false)
}

export async function apiFetch<T = unknown>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = false, headers: customHeaders, ...restOptions } = options
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  const headers = new Headers(customHeaders as HeadersInit)
  headers.set("Content-Type", "application/json")

  if (auth) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (token) {
      headers.set("authorization", token)
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

// ============================================================
// 구현된 API 함수들
// ============================================================

/**
 * 지역 목록 조회 (GET /regions)
 * @returns RegionItem[] 배열
 */
export async function fetchRegions(query?: string, page = 1): Promise<RegionItem[]> {
  const endpoint = withQuery(API_ENDPOINTS.GET_REGIONS, { q: query, page })
  return apiFetch<RegionItem[]>(endpoint)
}

/**
 * 지역 이름으로 region id 조회
 * @param regionName 지역 이름 (예: "옥천읍")
 * @returns region id 또는 null
 */
export async function fetchRegionId(regionName: string): Promise<number | null> {
  try {
    const data = await fetchRegions(regionName, 1)

    if (!Array.isArray(data) || data.length === 0) {
      return null
    }

    // 정확히 일치하는 지역 우선
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

/**
 * 사용자 생성 (POST /users)
 * @returns { token: string }
 */
export async function createUser(data: {
  nickname: string
  age: number
  gender: string
  job: string
  rid: number
}): Promise<{ token: string }> {
  return apiFetch<{ token: string }>(API_ENDPOINTS.CREATE_USER, {
    method: "POST",
    body: data,
  })
}

/**
 * 정책 사례 목록 조회 (GET /examples)
 * @returns { examples: ExampleSummary[] }
 */
export async function fetchExamples(query?: string, page = 1): Promise<{ examples: ExampleSummary[] }> {
  const endpoint = withQuery(API_ENDPOINTS.GET_EXAMPLES, { q: query, page })
  return apiFetch<{ examples: ExampleSummary[] }>(endpoint)
}

/**
 * 정책 사례 상세 조회 (GET /examples/{id})
 * @returns { example: ExampleDetail }
 */
export async function fetchExampleDetail(id: number | string): Promise<ExampleDetail> {
  const endpoint = API_ENDPOINTS.GET_EXAMPLE_DETAIL(id)
  return apiFetch<ExampleDetail>(endpoint, { auth: true })
}

/**
 * 정책 사례 상세 조회 (GET /examples/{eid})
 * 백엔드가 wrapper 없이 ExampleDetail 객체를 그대로 반환함
 * @returns ExampleDetail (wrapper 없음)
 */
export async function fetchExample(eid: number | string): Promise<ExampleDetail> {
  const endpoint = API_ENDPOINTS.GET_EXAMPLE(eid)
  return apiFetch<ExampleDetail>(endpoint, { auth: true })
}

/**
 * 가이드라인 생성 (POST /guidelines)
 * @returns GuidelinesResponse
 */
export async function createGuideline(data: {
  title: string
  rid: number
  categories: string[]
  problem: string
}): Promise<GuidelinesResponse> {
  return apiFetch<GuidelinesResponse>(API_ENDPOINTS.CREATE_GUIDELINE, {
    method: "POST",
    body: data,
    auth: true,
  })
}

/**
 * 정책 제안 목록 조회 (GET /proposals)
 * @returns { proposals: ProposalSummary[] }
 */
export async function fetchProposals(query?: string, page = 1): Promise<{ proposals: ProposalSummary[] }> {
  const endpoint = withQuery(API_ENDPOINTS.GET_PROPOSALS, { q: query || undefined, page })
  return apiFetch<{ proposals: ProposalSummary[] }>(endpoint, { auth: true })
}

/**
 * 정책 제안 상세 조회 (GET /proposals/{id})
 * @returns { proposal: ProposalDetail }
 */
export async function fetchProposalDetail(id: number | string): Promise<{ proposal: ProposalDetail }> {
  const endpoint = API_ENDPOINTS.GET_PROPOSAL_DETAIL(id)
  return apiFetch<{ proposal: ProposalDetail }>(endpoint, { auth: true })
}

/**
 * 정책 제안 상세 조회 (GET /proposals/{pid})
 * @returns { proposal: ProposalDetail } (wrapper 있음)
 */
export async function fetchProposal(pid: number | string): Promise<{ proposal: ProposalDetail }> {
  const endpoint = API_ENDPOINTS.GET_PROPOSAL(pid)
  return apiFetch<{ proposal: ProposalDetail }>(endpoint, { auth: true })
}

/**
 * 정책 제안 생성 (POST /proposals)
 * 새로 추가
 * @returns { pid: number }
 */
export async function createProposal(dto: CreateProposalDto): Promise<{ pid: number }> {
  return apiFetch<{ pid: number }>(API_ENDPOINTS.POST_PROPOSAL, {
    method: "POST",
    body: dto,
    auth: true,
  })
}

// ============================================================
// AI 교정 기능 (Mock 구현)
// TODO: 실제 LLM 엔드포인트 연동 시 이 함수를 수정
// ============================================================

/**
 * AI 텍스트 교정 (Mock)
 * 실제 LLM 연동 시 이 함수를 수정
 * @param input - 교정할 텍스트 (problem, method, effect)
 * @returns 교정된 텍스트
 */
export async function reviseProposalText(input: ReviseProposalInput): Promise<ReviseProposalOutput> {
  // TODO: 실제 LLM 엔드포인트 연동
  // 현재는 Mock 구현: 간단한 문장 다듬기 시뮬레이션

  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800))

  const mockRevise = (text: string): string => {
    if (!text.trim()) return text

    let revised = text

    // 간단한 교정 규칙 적용 (mock)
    // 1. 문장 끝에 마침표 추가
    if (
      revised.trim() &&
      !revised.trim().endsWith(".") &&
      !revised.trim().endsWith("요") &&
      !revised.trim().endsWith("다")
    ) {
      revised = revised.trim() + "."
    }

    // 2. "~해요" -> "~합니다" 변환 (일부)
    revised = revised.replace(/힘들어요/g, "어려움을 겪고 있습니다")
    revised = revised.replace(/없어요/g, "부족합니다")
    revised = revised.replace(/좋겠어요/g, "기대됩니다")

    // 3. 접속사 추가
    if (revised.includes("그래서") === false && revised.length > 20) {
      revised = revised.replace(/\. /, ". 따라서 ")
    }

    // 4. 강조 표현 추가
    revised = revised.replace(/이동할 수 있/g, "편리하게 이동할 수 있")
    revised = revised.replace(/설치해/g, "체계적으로 설치해")

    return revised
  }

  return {
    problem: mockRevise(input.problem),
    method: mockRevise(input.method),
    effect: mockRevise(input.effect),
  }
}

/**
 * 단일 필드 AI 교정 (Mock)
 * @param fieldName - 필드 이름 (problem, method, effect)
 * @param text - 교정할 텍스트
 * @returns 교정된 텍스트
 */
export async function reviseProposalField(fieldName: "problem" | "method" | "effect", text: string): Promise<string> {
  const input: ReviseProposalInput = {
    problem: fieldName === "problem" ? text : "",
    method: fieldName === "method" ? text : "",
    effect: fieldName === "effect" ? text : "",
  }

  const result = await reviseProposalText(input)
  return result[fieldName]
}

// ============================================================
// Helper to replace :id with actual id
// ============================================================
export function buildEndpoint(endpoint: string, params: Record<string, string | number>): string {
  let built = endpoint
  Object.keys(params).forEach((key) => {
    built = built.replace(`:${key}`, String(params[key]))
  })
  return built
}

// ============================================================
// @deprecated - 하위 호환성을 위해 유지, apiFetch 사용 권장
// ============================================================
/** @deprecated apiFetch를 사용하세요 */
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
