"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Heart, MessageCircle, Bookmark, Menu } from "lucide-react"
import type { Example, PolicyCategory } from "@/types"
import { POLICY_CATEGORIES } from "@/lib/constants"

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
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto px-4 pb-3">
          <div className="flex gap-2">
            {POLICY_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
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
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
            최신순
          </Button>
        </div>
      </div>

      {/* Policy Cards */}
      <div className="flex-1 space-y-3 p-4">
        {filteredExamples.map((example) => (
          <Card key={example.id} className="overflow-hidden border-0 shadow-sm">
            {/* Thumbnail */}
            <div className="relative aspect-[2/1] bg-muted">
              <div className="flex h-full items-center justify-center">
                <div className="text-muted-foreground/30">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 p-4">
              {/* Tags */}
              <div className="flex gap-2">
                {example.tags?.slice(0, 2).map((tag) => (
                  <span key={tag.id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-pretty text-base font-semibold leading-snug">{example.title}</h3>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleLike(example.id)}
                    className="flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    <Heart className={`h-4 w-4 ${example.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    <span>{example.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 transition-colors hover:text-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{example.comments || 0}</span>
                  </button>
                </div>
                <button onClick={() => handleBookmark(example.id)} className="transition-colors hover:text-foreground">
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
      <div className="sticky bottom-0 border-t bg-background">
        <div className="flex items-center justify-around p-2">
          <button className="flex flex-col items-center gap-1 px-6 py-2 text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <span className="text-xs font-medium">정책 사례</span>
          </button>
          <button
            onClick={() => router.push("/proposals")}
            className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span className="text-xs">정책 제안</span>
          </button>
          <button
            onClick={() => router.push("/mypage")}
            className="flex flex-col items-center gap-1 px-6 py-2 text-muted-foreground"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs">마이페이지</span>
          </button>
        </div>
      </div>
    </div>
  )
}
