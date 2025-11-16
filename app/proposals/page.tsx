"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Search, Heart, MessageCircle, Bookmark, ChevronDown } from 'lucide-react'
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
    tags: [{ id: 1, name: "교통" }, { id: 2, name: "교육" }],
    likes: 160,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
    author: { nickname: "옥천시민", region: "안내면" }
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
    tags: [{ id: 1, name: "교통" }, { id: 2, name: "교육" }],
    likes: 160,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
    author: { nickname: "옥천시민", region: "안내면" }
  }
]

export default function ProposalsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>("전체")
  const [proposals, setProposals] = useState(mockProposals)
  const [searchQuery, setSearchQuery] = useState("")

  const handleLike = (proposalId: number) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId 
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ))
    // TODO: Call API to update like status
  }

  const handleBookmark = (proposalId: number) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId 
        ? { ...p, isBookmarked: !p.isBookmarked }
        : p
    ))
    // TODO: Call API to update bookmark status
  }

  const getRelativeTime = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24))
    return `${days}일 전`
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-background px-4 pb-3 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="지역, 정책 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
            />
          </div>
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
          {POLICY_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-[#d3c1ff] text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* New Proposal Button */}
        <button
          onClick={() => router.push("/proposals/new")}
          className="mb-4 w-full rounded-xl bg-[#d3c1ff] py-3 text-center font-medium transition-colors hover:bg-[#c5b3f0] active:bg-[#b7a5e2]"
        >
          새로운 정책 제안하기
        </button>

        {/* Sort Dropdown */}
        <div className="flex justify-end">
          <button className="flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <span>최신순</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Proposals List */}
      <div className="flex-1 space-y-4 px-4 pb-20">
        {proposals.map((proposal) => (
          <button
            key={proposal.id}
            onClick={() => router.push(`/proposals/${proposal.id}`)}
            className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-sm"
          >
            {/* Tags and Date */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-2">
                {proposal.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-[#d3c1ff] px-3 py-1 text-xs font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {getRelativeTime(proposal.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3 className="mb-2 text-base font-semibold leading-snug">
              {proposal.title}
            </h3>

            {/* Content */}
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {proposal.content}
            </p>

            {/* Author Info */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{proposal.author.nickname}</span>
                <span className="rounded-full bg-[#d3c1ff] px-2.5 py-0.5 text-xs font-medium">
                  {proposal.author.region}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike(proposal.id)
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Heart
                    className={`h-5 w-5 ${proposal.isLiked ? "fill-red-500 text-red-500" : ""}`}
                  />
                  <span>동의해요 {proposal.likes}</span>
                </button>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{proposal.comments}</span>
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleBookmark(proposal.id)
                }}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bookmark
                  className={`h-5 w-5 ${proposal.isBookmarked ? "fill-current" : ""}`}
                />
              </button>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
