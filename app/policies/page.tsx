"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Heart, MessageCircle, Bookmark, Menu } from 'lucide-react'
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
      { id: 3, name: "김천" },
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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header with Search */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="지역, 정책 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto scrollbar-hide px-4 pb-3">
          <div className="flex gap-2">
            {POLICY_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-[#d3c1ff] text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Button */}
        <div className="flex justify-end px-4 pb-3">
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground h-8">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="opacity-60">
              <path d="M3 8V2h1v6h1l-1.5 2L2 8h1zm4-6v6H6v1.5L4.5 8 6 6.5V8h1V2h1z" />
            </svg>
            최신순
          </Button>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="flex-1 space-y-4 p-4 pb-20">
        {filteredExamples.map((example) => (
          <Card key={example.id} className="overflow-hidden border-0 shadow-sm">
            {/* Thumbnail */}
            <div onClick={() => handleCardClick(example.id)} className="cursor-pointer">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-[#e8deff] to-[#d3c1ff]/30">
                <div className="flex h-full items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-[#d3c1ff]">
                    <rect x="4" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.4" />
                    <path d="M4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
                  </svg>
                </div>
                
                {/* Tags positioned at bottom left of thumbnail */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {example.tags?.slice(0, 2).map((tag) => (
                    <span 
                      key={tag.id} 
                      className="rounded bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 p-4">
                {/* Title */}
                <h3 className="text-pretty text-[15px] font-semibold leading-snug">{example.title}</h3>
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(example.id)
                    }}
                    className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                  >
                    <Heart className={`h-[18px] w-[18px] ${example.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="text-[13px]">{example.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                    <MessageCircle className="h-[18px] w-[18px]" />
                    <span className="text-[13px]">{example.comments || 0}</span>
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark(example.id)
                  }}
                  className="transition-colors hover:text-foreground"
                >
                  <Bookmark
                    className={`h-5 w-5 ${
                      example.isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
