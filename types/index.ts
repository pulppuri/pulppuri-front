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
  read_cnt?: number
  created_at?: number
  updated_at?: number
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
// 프론트엔드 전용 타입 (UI/온보딩용)
// ============================================================

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
