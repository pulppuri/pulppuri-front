"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Heart, MessageCircle, Bookmark, ChevronDown, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import type { Proposal, PolicyCategory } from "@/types"
import { BottomNav } from "@/components/bottom-nav"
import { POLICY_CATEGORIES } from "@/lib/constants"

const mockProposals: (Proposal & {
  likes: number
  comments: number
  isLiked: boolean
  isBookmarked: boolean
  author: { nickname: string; region: string }
})[] = [
  {
    id: 1,
    eid: 1,
    rid: 1,
    uid: 1,
    title: "안남면 마을도서관 버스 노선 확충 제안합니다.",
    content: "아이들이 도서관에 더 자주 다닐 수 있도록 도서관으로 가는 버스 노선 확충을 건의드리고 싶습니다.",
    read_cnt: 160,
    created_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    tags: [
      { id: 1, name: "교통" },
      { id: 2, name: "교육" },
    ],
    likes: 160,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
    author: { nickname: "옥천시민", region: "안내면" },
  },
  {
    id: 2,
    eid: 2,
    rid: 1,
    uid: 2,
    title: "안남면 마을도서관 버스 노선 확충 제안합니다.",
    content: "아이들이 도서관에 더 자주 다닐 수 있도록 도서관으로 가는 버스 노선 확충을 건의드리고 싶습니다.",
    read_cnt: 160,
    created_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updated_at: Date.now() - 3 * 24 * 60 * 60 * 1000,
    tags: [
      { id: 1, name: "교통" },
      { id: 2, name: "교육" },
    ],
    likes: 160,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
    author: { nickname: "옥천시민", region: "안내면" },
  },
]

export default function ProposalsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>("전체")
  const [proposals, setProposals] = useState(mockProposals)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLike = (proposalId: number) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p,
      ),
    )
    // TODO: Call API to update like status
  }

  const handleBookmark = (proposalId: number) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, isBookmarked: !p.isBookmarked } : p)))
    // TODO: Call API to update bookmark status
  }

  const getRelativeTime = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
    return `${days}일 전`
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

      {/* Proposals List */}
      <div className="flex-1 space-y-3 px-4 pb-20 pt-4">
        {proposals.map((proposal) => (
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
                {proposal.tags?.map((tag: any) => (
                  <span key={tag.id} className="rounded bg-[#b69df8] px-2.5 py-0.5 text-xs font-medium text-white">
                    {tag.name}
                  </span>
                ))}
              </div>
              <span className="text-xs text-[#929292]">{getRelativeTime(proposal.created_at)}</span>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-[14px] font-semibold leading-snug text-black">{proposal.title}</h3>

            {/* Content */}
            <p className="mb-3 text-[13px] leading-relaxed text-[#666666]">{proposal.content}</p>

            {/* Author Info */}
            <div className="mb-3 flex items-center gap-2.5">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#f5f5f5]" />
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-black">{proposal.author.nickname}</span>
                <span className="rounded bg-[#b69df8] px-2 py-0.5 text-xs font-medium text-white">
                  {proposal.author.region}
                </span>
              </div>
            </div>

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
                  <span>동의해요 {proposal.likes}</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[13px] text-[#929292] transition-colors hover:text-[#b69df8]"
                >
                  <MessageCircle className="h-[17px] w-[17px]" />
                  <span>{proposal.comments}</span>
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleBookmark(proposal.id)
                }}
                className="text-[#929292] transition-colors hover:text-[#b69df8]"
              >
                <Bookmark
                  className={`h-[18px] w-[18px] ${proposal.isBookmarked ? "fill-[#b69df8] text-[#b69df8]" : ""}`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
