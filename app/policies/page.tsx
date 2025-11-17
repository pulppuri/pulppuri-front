"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Heart, MessageCircle, Bookmark, SlidersHorizontal, Plus, ChevronDown, ArrowUpDown } from 'lucide-react'
import type { Example, PolicyCategory } from "@/types"
import { POLICY_CATEGORIES } from "@/lib/constants"
import { BottomNav } from "@/components/bottom-nav"

// Mock data for now
const MOCK_EXAMPLES: Example[] = [
  {
    id: 1,
    rid: 1,
    uid: 1,
    title: "청년 살기 좋은 지역으로: 함양군 청년 특성 강화한 정책 펼쳐",
    content: "청년들을 위한 주거 지원과 일자리 창출 정책",
    reference: "함양군",
    read_cnt: 150,
    created_at: Date.now(),
    updated_at: Date.now(),
    tags: [
      { id: 1, name: "청년" },
      { id: 2, name: "정주" },
    ],
    likes: 50,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    rid: 1,
    uid: 2,
    title: "전폭 크게 준비해야...계단식 열량, 2천 김천칠방속박 대박 예열",
    content: "대중교통 개선과 지역 연결성 강화",
    reference: "김천시",
    read_cnt: 220,
    created_at: Date.now(),
    updated_at: Date.now(),
    tags: [
      { id: 3, name: "문화" },
      { id: 4, name: "운송" },
    ],
    likes: 50,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
  },
]

export default function PoliciesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>("전체")
  const [examples, setExamples] = useState<Example[]>(MOCK_EXAMPLES)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/welcome")
      return
    }

    // TODO: Fetch examples from backend
    // fetchExamples()
  }, [router])

  const handleLike = (id: number) => {
    setExamples(
      examples.map((ex) =>
        ex.id === id ? { ...ex, likes: (ex.likes || 0) + (ex.isLiked ? -1 : 1), isLiked: !ex.isLiked } : ex,
      ),
    )
    // TODO: API call to backend
  }

  const handleBookmark = (id: number) => {
    setExamples(examples.map((ex) => (ex.id === id ? { ...ex, isBookmarked: !ex.isBookmarked } : ex)))
    // TODO: API call to backend
  }

  const handleCardClick = (id: number) => {
    router.push(`/policies/${id}`)
  }

  const filteredExamples = examples.filter((ex) => {
    if (selectedCategory !== "전체") {
      const hasCategory = ex.tags?.some((tag) => tag.name === selectedCategory)
      if (!hasCategory) return false
    }
    if (searchQuery) {
      return ex.title.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

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
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-50">
            <SlidersHorizontal className="h-[18px] w-[18px] text-gray-400 stroke-[1.5]" />
          </Button>
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

        <div className="flex justify-end px-3.5 pb-2.5">
          <button className="flex items-center gap-1.5 rounded-full border border-[#d0d0d0] bg-white px-3 py-1.5 text-sm text-[#666666] hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="h-3.5 w-3.5" />
            최신순
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="flex-1 space-y-3 p-4 pb-24">
        {filteredExamples.map((example) => (
          <Card key={example.id} className="overflow-hidden border-0 shadow-sm bg-white rounded-xl">
            {/* Thumbnail */}
            <div onClick={() => handleCardClick(example.id)} className="cursor-pointer">
              <div className="relative aspect-[2/1] bg-gradient-to-br from-[#e8deff] to-[#d3c1ff]/30">
                <div className="flex h-full items-center justify-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-[#d3c1ff]">
                    <rect x="4" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.5" />
                    <path d="M4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                  </svg>
                </div>
                
                {/* Tags positioned at bottom left of thumbnail */}
                <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-black">
                    {example.reference}
                  </span>
                  {example.tags?.slice(0, 1).map((tag) => (
                    <span 
                      key={tag.id} 
                      className="rounded bg-[#b69df8] px-2 py-0.5 text-xs font-medium text-white"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2 p-3">
                {/* Title */}
                <h3 className="text-pretty text-[14px] font-semibold leading-snug text-black">{example.title}</h3>
              </div>
            </div>

            <div className="px-3 pb-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-[#929292]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(example.id)
                    }}
                    className="flex items-center gap-1 transition-colors hover:text-[#b69df8]"
                  >
                    <Heart className={`h-[17px] w-[17px] ${example.isLiked ? "fill-[#b69df8] text-[#b69df8]" : ""}`} />
                    <span className="text-[13px]">{example.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 transition-colors hover:text-[#b69df8]">
                    <MessageCircle className="h-[17px] w-[17px]" />
                    <span className="text-[13px]">{example.comments || 0}</span>
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark(example.id)
                  }}
                  className="transition-colors hover:text-[#b69df8]"
                >
                  <Bookmark
                    className={`h-[18px] w-[18px] ${
                      example.isBookmarked ? "fill-[#b69df8] text-[#b69df8]" : "text-[#929292]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button
        onClick={() => {
          // TODO: Navigate to add policy example page
          console.log("[v0] Add policy example button clicked")
        }}
        className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#b69df8] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
