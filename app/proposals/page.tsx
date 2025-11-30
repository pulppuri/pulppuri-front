"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Heart,
  MessageCircle,
  Bookmark,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Loader2,
} from "lucide-react"
import type { ProposalSummary, PolicyCategory } from "@/types"
import { BottomNav } from "@/components/bottom-nav"
import { POLICY_CATEGORIES } from "@/lib/constants"
import { requireAuth } from "@/lib/auth"
import { fetchProposals } from "@/lib/api"

interface ProposalWithUI extends ProposalSummary {
  isLiked: boolean
  isBookmarked: boolean
}

export default function ProposalsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>("전체")
  const [proposals, setProposals] = useState<ProposalWithUI[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    requireAuth(router)
  }, [router])

  useEffect(() => {
    let cancelled = false

    async function loadProposals() {
      setIsLoading(true)
      setErrorMsg(null)

      try {
        const data = await fetchProposals(searchQuery || undefined, 1)
        if (cancelled) return

        // UI 필드 초기화
        const withUI: ProposalWithUI[] = (data.proposals || []).map((p) => ({
          ...p,
          isLiked: false,
          isBookmarked: false,
        }))
        setProposals(withUI)
      } catch (err) {
        if (cancelled) return
        // 에러 메시지 분기
        if (err instanceof Error && err.message.includes("API Error")) {
          setErrorMsg("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } else {
          setErrorMsg("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProposals()

    return () => {
      cancelled = true
    }
  }, [searchQuery, retryKey])

  const filteredProposals =
    selectedCategory === "전체" ? proposals : proposals.filter((p) => p.categories?.includes(selectedCategory))

  const handleLike = (proposalId: number) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? (p.likes || 1) - 1 : (p.likes || 0) + 1 }
          : p,
      ),
    )
    // TODO: backend endpoint not implemented
  }

  const handleBookmark = (proposalId: number) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, isBookmarked: !p.isBookmarked } : p)))
    // TODO: backend endpoint not implemented
  }

  const formatDate = (value?: string | number) => {
    if (!value) return ""
    try {
      const date = new Date(typeof value === "number" ? value : value)
      if (isNaN(date.getTime())) return ""
      const now = Date.now()
      const diff = now - date.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      if (days === 0) return "오늘"
      if (days < 7) return `${days}일 전`
      return date.toLocaleDateString("ko-KR")
    } catch {
      return ""
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2.5 p-3.5">
          <div className="flex flex-1 items-center gap-2.5 rounded-xl bg-[#fafafa] px-3.5 py-2.5 border border-gray-100">
            <Search className="h-[18px] w-[18px] text-gray-400 stroke-[1.5]" />
            <input
              type="text"
              placeholder="지역, 정책 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button className="flex h-9 w-9 items-center justify-center hover:bg-gray-50 rounded-lg">
            <SlidersHorizontal className="h-[18px] w-[18px] text-gray-400 stroke-[1.5]" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto scrollbar-hide px-3.5 pb-2.5">
          <div className="flex gap-2">
            {POLICY_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-[#b69df8] text-white"
                    : "bg-[#f5f5f5] text-black hover:bg-[#efefef]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* New Proposal Button */}
        <button
          onClick={() => router.push("/proposals/new")}
          className="mx-3.5 mb-3 w-[calc(100%-1.75rem)] rounded-xl bg-[#b69df8] py-3 text-center font-medium text-white transition-colors hover:bg-[#a88def] active:bg-[#9a7de6]"
        >
          새로운 정책 제안하기
        </button>

        {/* Sort Dropdown */}
        <div className="flex justify-end px-3.5 pb-2.5">
          <button className="flex items-center gap-1.5 rounded-full border border-[#d0d0d0] bg-white px-3 py-1.5 text-sm text-[#666666] hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            최신순
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 pb-20 pt-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#b69df8]" />
            <p className="mt-3 text-sm text-gray-500">불러오는 중...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-center text-sm text-red-500">{errorMsg}</p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-4 rounded-lg bg-[#b69df8] px-4 py-2 text-sm text-white hover:bg-[#a88def]"
            >
              다시 시도
            </button>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-center text-sm text-gray-500">검색 결과가 없어요</p>
          </div>
        ) : (
          filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/proposals/${proposal.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(`/proposals/${proposal.id}`)
                }
              }}
              className="w-full rounded-xl border-0 bg-white p-3.5 text-left shadow-sm transition-shadow hover:shadow-md cursor-pointer"
            >
              {/* Tags and Date */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {proposal.categories?.map((cat, idx) => (
                    <span key={idx} className="rounded bg-[#b69df8] px-2.5 py-0.5 text-xs font-medium text-white">
                      {cat}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-[#929292]">{formatDate(proposal.created_at)}</span>
              </div>

              {/* Title */}
              <h3 className="mb-2 text-[14px] font-semibold leading-snug text-black">{proposal.title}</h3>

              {/* Region */}
              {proposal.region && <p className="mb-3 text-[13px] text-[#666666]">{proposal.region}</p>}

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(proposal.id)
                    }}
                    className="flex items-center gap-1 text-[13px] text-[#929292] transition-colors hover:text-[#b69df8]"
                  >
                    <Heart className={`h-[17px] w-[17px] ${proposal.isLiked ? "fill-[#b69df8] text-[#b69df8]" : ""}`} />
                    <span>동의해요 {proposal.likes || 0}</span>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[13px] text-[#929292] transition-colors hover:text-[#b69df8]"
                  >
                    <MessageCircle className="h-[17px] w-[17px]" />
                    <span>{proposal.comments || 0}</span>
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark(proposal.id)
                  }}
                  className="text-[#929292] transition-colors hover:text-[#b69df8]"
                >
                  {/* TODO: backend endpoint not implemented */}
                  <Bookmark
                    className={`h-[18px] w-[18px] ${proposal.isBookmarked ? "fill-[#b69df8] text-[#b69df8]" : ""}`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
