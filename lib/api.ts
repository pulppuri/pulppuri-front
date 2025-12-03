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
  HelperDto,
  ExDto,
  CreateExampleResponse,
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
  GET_EXAMPLE_DETAIL: (id: number | string) => `/examples/${id}`,
  GET_EXAMPLE: (eid: number | string) => `/examples/${eid}`,
  CREATE_EXAMPLE: "/examples", // POST: ExDto → CreateExampleResponse

  // Guidelines
  CREATE_GUIDELINE: "/guidelines", // POST: { title, rid, categories, problem } → GuidelinesResponse

  // Proposals (정책 제안)
  GET_PROPOSALS: "/proposals", // GET: ?q=&page= → { proposals: ProposalSummary[] }
  GET_PROPOSAL_DETAIL: (id: number | string) => `/proposals/${id}`,
  GET_PROPOSAL: (pid: number | string) => `/proposals/${pid}`,
  POST_PROPOSAL: "/proposals",

  HELPER: "/helper", // POST: HelperDto → HelperDto (교정된 텍스트)

  AUTOFILL: "/autofill", // POST: { url } → 요약 텍스트
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
  UPDATE_EXAMPLE: "/examples/:id",
  DELETE_EXAMPLE: "/examples/:id",
  LIKE_EXAMPLE: "/examples/:id/like",
  BOOKMARK_EXAMPLE: "/examples/:id/bookmark",
  GET_EXAMPLE_COMMENTS: "/examples/:id/comments",
  CREATE_EXAMPLE_COMMENT: "/examples/:id/comments",

  // Proposals
  GET_PROPOSAL_BY_ID: "/proposals/:id",
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

  const contentType = response.headers.get("content-type") ?? ""
  console.log(`[apiFetch] ${endpoint} content-type=${contentType}`)

  // 204 No Content 또는 빈 바디 처리
  const text = await response.text()
  if (!text || text.trim() === "") {
    console.log(`[apiFetch] parsedType=null (empty body)`)
    return null as T
  }

  // application/json이면 바로 파싱
  if (contentType.includes("application/json")) {
    try {
      const parsed = JSON.parse(text)
      console.log(`[apiFetch] parsedType=${typeof parsed}`)
      return parsed as T
    } catch (e) {
      console.warn(`[apiFetch] JSON parse failed for json content-type:`, e)
      return text as T
    }
  }

  // 그 외: 텍스트가 { 또는 [로 시작하면 JSON.parse 시도
  const trimmed = text.trim()
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed)
      console.log(`[apiFetch] parsedType=${typeof parsed} (parsed from text)`)
      return parsed as T
    } catch (e) {
      console.warn(`[apiFetch] JSON parse failed for text response:`, e)
    }
  }

  // 파싱 실패 시 text 그대로 반환
  console.log(`[apiFetch] parsedType=string (raw text)`)
  return text as T
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
 * 정책 사례 생성 (POST /examples)
 * @param dto - ExDto 형태 { rid, title, thumbnail?, content, reference, tags }
 * @returns CreateExampleResponse
 */
export async function createExample(dto: ExDto): Promise<CreateExampleResponse> {
  return apiFetch<CreateExampleResponse>(API_ENDPOINTS.CREATE_EXAMPLE, {
    method: "POST",
    body: dto,
    auth: true,
  })
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
// Helper API (AI 교정)
// ============================================================

interface HelperLike {
  title?: string
  problem?: string
  method?: string
  effect?: string
}

/**
 * /helper 응답에서 HelperLike 객체를 추출하는 강건한 파서
 * - wrapper 키 후보: result, data, payload, output, response
 * - 키 매핑: solution → method, expectedEffect → effect
 * - DFS: 위 wrapper가 없으면 객체 내부를 탐색하여 problem/method/effect 키를 가진 객체를 찾음
 */
function extractHelperLike(raw: unknown): HelperLike | null {
  if (!raw || typeof raw !== "object") return null

  const obj = raw as Record<string, unknown>

  // 1) wrapper 키 후보 시도
  const wrapperKeys = ["result", "data", "payload", "output", "response"]
  for (const key of wrapperKeys) {
    if (obj[key] && typeof obj[key] === "object") {
      const extracted = tryExtract(obj[key] as Record<string, unknown>)
      if (extracted) return extracted
    }
  }

  // 2) raw 자체가 HelperLike인지 확인
  const directExtract = tryExtract(obj)
  if (directExtract) return directExtract

  // 3) DFS로 객체 내부를 탐색하여 problem/method/effect 키를 가진 객체 찾기
  const found = dfsFind(obj)
  if (found) return found

  return null
}

/**
 * 객체에서 HelperLike 필드를 추출 (키 매핑 포함)
 */
function tryExtract(obj: Record<string, unknown>): HelperLike | null {
  // problem, method(또는 solution), effect(또는 expectedEffect) 중 하나라도 있으면 성공
  const problem = obj.problem as string | undefined
  const method = (obj.method ?? obj.solution) as string | undefined
  const effect = (obj.effect ?? obj.expectedEffect) as string | undefined
  const title = obj.title as string | undefined

  if (problem !== undefined || method !== undefined || effect !== undefined) {
    return { title, problem, method, effect }
  }
  return null
}

/**
 * DFS로 객체 내부를 탐색하여 problem/method/effect 키를 가진 객체를 찾음
 */
function dfsFind(obj: unknown, depth = 0): HelperLike | null {
  if (depth > 5 || !obj || typeof obj !== "object") return null

  const record = obj as Record<string, unknown>

  // 현재 객체에서 추출 시도
  const extracted = tryExtract(record)
  if (extracted) return extracted

  // 자식 객체 탐색
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") {
      const found = dfsFind(value, depth + 1)
      if (found) return found
    }
  }

  return null
}

/**
 * AI 텍스트 교정 (POST /helper)
 * 백엔드에서 교정된 텍스트를 반환
 * @param dto - 교정할 텍스트 { title, problem, method, effect }
 * @returns 교정된 텍스트 { title, problem, method, effect }
 */
export async function helperRevise(dto: HelperDto): Promise<HelperDto> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(API_ENDPOINTS.HELPER, {
      method: "POST",
      body: dto,
      auth: false,
    })

    console.log("[helper] raw typeof:", typeof raw)
    console.log("[helper] raw response:", raw)

    let normalized = raw
    if (typeof raw === "string") {
      try {
        normalized = JSON.parse(raw)
        console.log("[helper] parsed string to object")
      } catch (e) {
        console.warn("[helper] raw is string but JSON.parse failed:", e)
      }
    }
    console.log("[helper] normalized typeof:", typeof normalized)

    // 강건한 파서로 추출
    const extracted = extractHelperLike(normalized)

    if (extracted) {
      const mapped: HelperDto = {
        title: extracted.title ?? dto.title,
        problem: extracted.problem ?? dto.problem,
        method: extracted.method ?? dto.method,
        effect: extracted.effect ?? dto.effect,
      }
      console.log("[helper] mapped:", mapped)
      return mapped
    }

    // fallback: 원본 반환
    console.warn("[helper] 응답 파싱 실패로 fallback - raw:", raw)
    return dto
  } catch (error) {
    console.error("[helper] revise failed", error)
    throw error
  }
}

/**
 * 단일 필드 AI 교정 (POST /helper 사용)
 * 백엔드가 필드별 API를 제공하지 않으므로 전체 호출 후 해당 필드만 추출
 * @param fieldName - 필드 이름 (problem, method, effect)
 * @param currentTexts - 현재 텍스트 { title, problem, method, effect }
 * @returns 해당 필드의 교정된 텍스트
 */
export async function helperReviseField(
  fieldName: "problem" | "method" | "effect",
  currentTexts: HelperDto,
): Promise<string> {
  const result = await helperRevise(currentTexts)
  return result[fieldName]
}

// ============================================================
// URL 요약 생성 API (POST /autofill)
// ============================================================

/**
 * /autofill 응답에서 요약 텍스트를 추출하는 강건한 파서
 * - string이면 그대로 반환
 * - 객체면 후보 키(summary, content, result, data, payload)에서 추출
 * - 중첩 객체면 DFS로 문자열 찾기
 */
function extractAutofillContent(raw: unknown): { summary?: string; title?: string } | null {
  // string이면 그대로 요약으로 사용
  if (typeof raw === "string") {
    const trimmed = raw.trim()
    // JSON 문자열일 수 있으니 파싱 시도
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed)
        return extractAutofillContent(parsed)
      } catch {
        // 파싱 실패하면 그냥 문자열로 사용
      }
    }
    return { summary: trimmed }
  }

  if (!raw || typeof raw !== "object") return null

  const obj = raw as Record<string, unknown>

  // 직접 필드 체크
  const candidateKeys = ["summary", "content", "result", "data", "payload", "text", "output"]

  // title 추출
  const title = typeof obj.title === "string" ? obj.title : undefined

  // summary 추출
  for (const key of candidateKeys) {
    const val = obj[key]
    if (typeof val === "string" && val.trim()) {
      return { summary: val.trim(), title }
    }
    if (val && typeof val === "object") {
      // 중첩 객체에서 추출 시도
      const nested = extractAutofillContent(val)
      if (nested?.summary) {
        return { summary: nested.summary, title: nested.title || title }
      }
    }
  }

  // DFS로 첫 번째 긴 문자열 찾기 (최소 20자 이상)
  const foundString = dfsFindString(obj)
  if (foundString) {
    return { summary: foundString, title }
  }

  return null
}

/**
 * DFS로 객체 내에서 가장 긴 문자열 찾기
 */
function dfsFindString(obj: unknown, depth = 0): string | null {
  if (depth > 5 || !obj) return null

  if (typeof obj === "string" && obj.trim().length >= 20) {
    return obj.trim()
  }

  if (typeof obj === "object") {
    const record = obj as Record<string, unknown>
    let longest: string | null = null

    for (const value of Object.values(record)) {
      const found = dfsFindString(value, depth + 1)
      if (found && (!longest || found.length > longest.length)) {
        longest = found
      }
    }

    return longest
  }

  return null
}

/**
 * URL에서 요약 자동 생성 (POST /autofill)
 * @param url - 기사 URL
 * @returns { summary?: string; title?: string } 또는 null
 */
export async function autofillFromUrl(url: string): Promise<{ summary?: string; title?: string } | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiFetch<any>(API_ENDPOINTS.AUTOFILL, {
      method: "POST",
      body: { url },
      auth: false,
    })

    console.log("[autofill] raw response:", raw)

    const extracted = extractAutofillContent(raw)

    if (extracted) {
      console.log("[autofill] extracted:", extracted)
      return extracted
    }

    console.warn("[autofill] 응답 파싱 실패 - raw:", raw)
    return null
  } catch (error) {
    console.error("[autofill] error:", error)
    throw error
  }
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

/** @deprecated helperRevise를 사용하세요 */
export async function reviseProposalText(input: {
  problem: string
  method: string
  effect: string
}): Promise<{ problem: string; method: string; effect: string }> {
  // helperRevise로 위임
  const result = await helperRevise({
    title: "",
    problem: input.problem,
    method: input.method,
    effect: input.effect,
  })
  return {
    problem: result.problem,
    method: result.method,
    effect: result.effect,
  }
}

/** @deprecated helperReviseField를 사용하세요 */
export async function reviseProposalField(fieldName: "problem" | "method" | "effect", text: string): Promise<string> {
  const result = await helperRevise({
    title: "",
    problem: fieldName === "problem" ? text : "",
    method: fieldName === "method" ? text : "",
    effect: fieldName === "effect" ? text : "",
  })
  return result[fieldName]
}
