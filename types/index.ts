// Type definitions based on backend database schema

// ============================================================
// 현재 구현된 타입 (FastAPI 백엔드 응답 기준)
// ============================================================

/**
 * GET /regions 응답 배열 아이템
 */
export interface RegionItem {
  id: number
  full_name: string
  display_name: string
}

/**
 * GET /examples 응답의 examples 배열 아이템
 */
export interface ExampleSummary {
  id: number
  title: string
  region: string
  categories: string[]
  sim?: number // 유사도 점수 (optional)
}

/**
 * GET /examples/{id} 응답의 example 객체
 */
export interface ExampleDetail {
  id: number
  title: string
  region: string
  categories: string[]
  content?: string
  body?: string
  reference?: string
  articleUrl?: string // 기사 원문 URL (백엔드 제공 시)
  read_cnt?: number
  created_at?: string | number // string | number로 보강
  updated_at?: string | number // string | number로 보강
  thumbnail?: string
  // UI 전용 (백엔드 미구현, 프론트에서 관리)
  likes?: number
  comments?: number
}

/**
 * POST /guidelines 응답
 */
export interface GuidelinesResponse {
  examples: ExampleSummary[]
  guidelines: {
    guide_1: string
    guide_2: string
    guide_3: string
    guide_4: string
  }
}

/**
 * GET /proposals 응답의 proposals 배열 아이템
 */
export interface ProposalSummary {
  id: number
  title: string
  region?: string
  categories: string[]
  created_at?: string | number
  // UI용 임시 필드 (백엔드 미구현)
  likes?: number
  comments?: number
  bookmarked?: boolean
}

/**
 * GET /proposals/{id} 응답의 proposal 객체
 */
export interface ProposalDetail {
  id: number
  eid?: number | null // 관련 정책 사례 ID
  title: string
  region?: string
  categories: string[]
  problem?: string
  method?: string // 백엔드 필드명
  solution?: string
  effect?: string
  expectedEffect?: string
  created_at?: string | number
  updated_at?: string | number
  nickname?: string // 백엔드 필드명
  author?: {
    nickname: string
    region?: string
  }
  // UI용 임시 필드 (백엔드 미구현)
  likes?: number
  comments?: number
  agrees?: number
  views?: number
}

/**
 * POST /users 요청 바디
 */
export interface CreateUserRequest {
  nickname: string
  age: number
  gender: string
  job: string
  rid: number
}

/**
 * POST /users 응답
 */
export interface CreateUserResponse {
  token: string
}

// ============================================================
// Helper API (AI 교정)
// ============================================================

/**
 * POST /helper 요청 바디
 */
export interface HelperDto {
  title: string
  problem: string
  method: string
  effect: string
}

/**
 * POST /helper 응답 (유연한 파싱 필요)
 */
export type HelperResponse = Partial<HelperDto> | { result?: Partial<HelperDto>; data?: Partial<HelperDto> }

/**
 * POST /examples 요청 바디
 */
export interface ExDto {
  rid: number
  title: string
  thumbnail?: string | null
  content: string
  reference: string // 기사 링크 URL
  tags: string[]
}

/**
 * POST /examples 응답 (유연한 파싱)
 */
export interface CreateExampleResponse {
  id?: number
  eid?: number
  // 기타 필드는 백엔드 응답에 따라 추가 가능
}

/**
 * POST /autofill 요청 바디
 */
export interface AutofillDto {
  url: string
}

/**
 * POST /autofill 응답 (유연한 파싱 필요)
 */
export type AutofillResponse = {
  summary?: string
  content?: string
  title?: string
  result?: string | { summary?: string; content?: string; title?: string }
  data?: string | { summary?: string; content?: string; title?: string }
  payload?: string | { summary?: string; content?: string; title?: string }
}

// ============================================================
// AI 교정 기능 타입 (프론트엔드용)
// ============================================================

export interface ReviseProposalInput {
  problem: string
  method: string
  effect: string
}

export interface ReviseProposalOutput {
  problem: string
  method: string
  effect: string
}

// ============================================================
// 프론트엔드 전용 타입 (UI/온보딩용)
// ============================================================

/**
 * CreateProposalRequest 타입 추가 (POST /proposals 요청 바디용)
 */
export interface CreateProposalDto {
  rid: number
  title: string
  eid?: number | null
  problem: string
  method: string
  effect: string
  tags: string[]
}

export interface User {
  id: number
  age: number
  job: string
  rid: number // region id
  gender: string
  nickname: string
  thumbnail?: string
  interests?: string[] // 관심 분야
}

export interface OnboardingData {
  nickname: string
  age: number
  gender: string
  job: string
  region: string // 읍/면 name (display_name)
  interests: string[] // 관심 분야
}

// Policy categories
export type PolicyCategory = "전체" | "교육" | "교통" | "주거" | "농업" | "청년" | "경제" | "문화" | "보건/복지"

// ============================================================
// 미구현/미사용 타입 (향후 백엔드 추가 시 사용)
// ============================================================

/**
 * @deprecated 현재 백엔드 미구현 - 상세 Region 정보
 */
export interface Region_NotImplemented {
  id: number
  si_do: string
  si_gun_gu: string
  eup_myeon_dong: string
  li: string
  full_name: string
  display_name: string
  shorten_name: string
}

/**
 * @deprecated 현재 백엔드 미구현 - Example 상세
 */
export interface Example_NotImplemented {
  id: number
  rid: number
  uid: number
  title: string
  thumbnail?: string
  content: string
  reference?: string
  read_cnt: number
  created_at: number
  updated_at: number
  tags?: Tag_NotImplemented[]
  imageUrl?: string
  likes?: number
  comments?: number
  isLiked?: boolean
  isBookmarked?: boolean
}

/**
 * @deprecated 현재 백엔드 미구현 - Proposal
 */
export interface Proposal_NotImplemented {
  id: number
  eid?: number
  rid: number
  uid: number
  title: string
  content: string
  read_cnt: number
  created_at: number
  updated_at: number
  tags?: Tag_NotImplemented[]
}

/**
 * @deprecated 현재 백엔드 미구현 - Tag
 */
export interface Tag_NotImplemented {
  id: number
  name: string
}

/**
 * @deprecated 현재 백엔드 미구현 - 기존 회원가입 (userId/password 방식)
 */
export interface SignupData_NotImplemented {
  userId: string
  password: string
  passwordConfirm: string
  nickname: string
  age: number
  gender: string
  job: string
  region: string
  interests: string[]
}

// ============================================================
// ============================================================
export type Region = Region_NotImplemented
export type Example = Example_NotImplemented
export type Proposal = Proposal_NotImplemented
export type Tag = Tag_NotImplemented
export type SignupData = SignupData_NotImplemented
