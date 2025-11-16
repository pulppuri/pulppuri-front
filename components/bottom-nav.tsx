"use client"

import { useRouter, usePathname } from 'next/navigation'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/policies') {
      return pathname === '/policies' || pathname.startsWith('/policies/')
    }
    if (path === '/proposals') {
      return pathname === '/proposals' || pathname.startsWith('/proposals/')
    }
    if (path === '/mypage') {
      return pathname === '/mypage' || pathname.startsWith('/mypage/')
    }
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around py-2">
        {/* 정책 사례 */}
        <button
          onClick={() => router.push('/policies')}
          className={`flex flex-col items-center gap-1 px-8 py-2 transition-colors ${
            isActive('/policies') ? 'text-[#8b5cf6]' : 'text-muted-foreground'
          }`}
        >
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
            isActive('/policies') ? 'bg-[#8b5cf6]' : 'bg-transparent'
          }`}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isActive('/policies') ? 'text-white' : 'text-muted-foreground'}
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className={`text-[11px] leading-none ${isActive('/policies') ? 'font-medium' : ''}`}>
            정책 사례
          </span>
        </button>

        {/* 정책 제안 */}
        <button
          onClick={() => router.push('/proposals')}
          className={`flex flex-col items-center gap-1 px-8 py-2 transition-colors ${
            isActive('/proposals') ? 'text-[#8b5cf6]' : 'text-muted-foreground'
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isActive('/proposals') ? 'currentColor' : 'none'}
              stroke={isActive('/proposals') ? 'none' : 'currentColor'}
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className={`text-[11px] leading-none ${isActive('/proposals') ? 'font-medium' : ''}`}>
            정책 제안
          </span>
        </button>

        {/* 마이페이지 */}
        <button
          onClick={() => router.push('/mypage')}
          className={`flex flex-col items-center gap-1 px-8 py-2 transition-colors ${
            isActive('/mypage') ? 'text-[#8b5cf6]' : 'text-muted-foreground'
          }`}
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isActive('/mypage') ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              {isActive('/mypage') ? (
                <>
                  <circle cx="12" cy="8" r="5" fill="currentColor" />
                  <path d="M3 21c0-4 4-7 9-7s9 3 9 7" fill="currentColor" />
                </>
              ) : (
                <>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </>
              )}
            </svg>
          </div>
          <span className={`text-[11px] leading-none ${isActive('/mypage') ? 'font-medium' : ''}`}>
            마이페이지
          </span>
        </button>
      </div>
    </nav>
  )
}
