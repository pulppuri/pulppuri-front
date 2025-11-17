"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Compass, Grid3x3, User } from 'lucide-react'

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
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-around">
        {/* 정책 사례 */}
        <button
          onClick={() => router.push('/policies')}
          className="flex flex-col items-center justify-center gap-1 transition-colors min-w-[80px]"
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isActive('/policies') ? 'bg-[#6366f1]' : ''
          }`}>
            <Compass 
              className={`h-5 w-5 ${
                isActive('/policies') ? 'text-white' : 'text-[#9ca3af]'
              }`}
              strokeWidth={2}
            />
          </div>
          <span className={`text-[11px] leading-none ${
            isActive('/policies') ? 'font-semibold text-black' : 'font-normal text-[#9ca3af]'
          }`}>
            정책 사례
          </span>
        </button>

        {/* 정책 제안 */}
        <button
          onClick={() => router.push('/proposals')}
          className="flex flex-col items-center justify-center gap-1 transition-colors min-w-[80px]"
        >
          <div className="flex items-center justify-center w-8 h-8">
            <Grid3x3 
              className={`h-6 w-6 ${
                isActive('/proposals') ? 'text-[#6366f1]' : 'text-[#9ca3af]'
              }`}
              strokeWidth={1.5}
            />
          </div>
          <span className={`text-[11px] leading-none ${
            isActive('/proposals') ? 'font-semibold text-black' : 'font-normal text-[#9ca3af]'
          }`}>
            정책 제안
          </span>
        </button>

        {/* 마이페이지 */}
        <button
          onClick={() => router.push('/mypage')}
          className="flex flex-col items-center justify-center gap-1 transition-colors min-w-[80px]"
        >
          <div className="flex items-center justify-center w-8 h-8">
            <User 
              className={`h-6 w-6 ${
                isActive('/mypage') ? 'text-[#6366f1]' : 'text-[#9ca3af]'
              }`}
              strokeWidth={1.5}
            />
          </div>
          <span className={`text-[11px] leading-none ${
            isActive('/mypage') ? 'font-semibold text-black' : 'font-normal text-[#9ca3af]'
          }`}>
            마이페이지
          </span>
        </button>
      </div>
    </nav>
  )
}
