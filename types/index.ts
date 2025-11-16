// Type definitions based on backend database schema

// Database Tables
export interface Region {
  id: number
  si_do: string
  si_gun_gu: string
  eup_myeon_dong: string
  li: string
  full_name: string
  display_name: string
  shorten_name: string
}

export interface User {
  id: number
  age: number
  job: string
  rid: number // region id
  gender: string
  nickname: string
  thumbnail?: string
}

export interface Example {
  id: number
  rid: number // region id
  uid: number // user id
  title: string
  thumbnail?: string
  content: string
  reference?: string
  read_cnt: number
  created_at: number
  updated_at: number
  tags?: Tag[]
  // UI state
  likes?: number
  comments?: number
  isLiked?: boolean
  isBookmarked?: boolean
}

export interface Proposal {
  id: number
  eid?: number // example id (optional reference)
  rid: number // region id
  uid: number // user id
  title: string
  content: string
  read_cnt: number
  created_at: number
  updated_at: number
  tags?: Tag[]
}

export interface Tag {
  id: number
  name: string
}

export interface ProposalLike {
  pid: number // proposal id
  uid: number // user id
}

export interface ProposalComment {
  id: number
  pid: number // proposal id
  uid: number // user id
  content: string
}

export interface ProposalBookmark {
  pid: number // proposal id
  uid: number // user id
}

// Onboarding form data
export interface OnboardingData {
  nickname: string
  age: number
  gender: string
  job: string
  region: string // 읍/면 name
}

export interface SignupData {
  userId: string
  password: string
  passwordConfirm: string
  nickname: string
  age: number
  gender: string
  job: string
  region: string
}

// Policy categories
export type PolicyCategory = "전체" | "교육" | "교통" | "주거" | "농촌" | "청년" | "경제"
