// Type definitions for the Okcheon Hanip app
// These types will be used throughout the application

export interface User {
  id: string
  email: string
  username: string
  region?: string
  interests?: string[]
  createdAt: string
}

export interface Policy {
  id: string
  title: string
  description: string
  category: PolicyCategory
  region: string
  likes: number
  comments: number
  bookmarks: number
  createdAt: string
  author: {
    id: string
    username: string
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

export type PolicyCategory = "전체" | "교통" | "교육" | "복지" | "경제" | "청년" | "농촌"

export interface Comment {
  id: string
  policyId: string
  content: string
  author: {
    id: string
    username: string
  }
  createdAt: string
}

export interface PolicyProposal {
  id: string
  title: string
  description: string
  category: PolicyCategory
  referencePolicy?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}
