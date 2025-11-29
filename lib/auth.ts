/**
 * 인증 관련 공통 유틸리티
 * - 로그인 상태는 localStorage.getItem("access_token") 존재 여부로 판단
 * - 로그아웃 시 access_token과 user 모두 제거
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

/**
 * 클라이언트 컴포넌트에서 인증 체크 후 미인증 시 /signup으로 리다이렉트
 * @param router - Next.js App Router instance
 * @returns boolean - 인증 여부 (true면 인증됨)
 */
export function requireAuth(router: AppRouterInstance): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("access_token")
  if (!token) {
    router.replace("/signup")
    return false
  }
  return true
}

/**
 * 토큰 존재 여부 체크 (리다이렉트 없이)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("access_token")
}

/**
 * 로그아웃 처리: access_token, user 제거 후 /signup으로 이동
 */
export function logout(router: AppRouterInstance): void {
  localStorage.removeItem("access_token")
  localStorage.removeItem("user")
  router.replace("/signup")
}

/**
 * 현재 저장된 사용자 정보 가져오기
 */
export function getStoredUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
