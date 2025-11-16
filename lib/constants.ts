// Constants for the app

// 옥천군 읍/면 리스트
export const OKCHEON_REGIONS = [
  "옥천읍",
  "군북면",
  "군서면",
  "동이면",
  "안남면",
  "안내면",
  "이원면",
  "청산면",
  "청성면",
] as const

export type OkcheonRegion = (typeof OKCHEON_REGIONS)[number]

// Gender options
export const GENDER_OPTIONS = ["남성", "여성", "기타"] as const

// Job categories
export const JOB_CATEGORIES = ["학생", "직장인", "자영업", "농업", "공무원", "주부", "무직", "기타"] as const

// Policy categories
export const POLICY_CATEGORIES = ["전체", "교육", "교통", "주거", "농업", "청년", "경제", "문화", "보건/복지"] as const
