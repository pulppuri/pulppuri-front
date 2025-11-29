"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, Heart, MessageCircle, Bookmark, SlidersHorizontal, Plus, ChevronDown, ArrowUpDown } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { POLICY_CATEGORIES } from "@/lib/constants"
import type { ExampleSummary, PolicyCategory } from "@/types"
import { apiFetch, withQuery, API_ENDPOINTS } from "@/lib/api"

export default function PoliciesPage() {
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory>("전체")
  const [searchQuery, setSearchQuery] = useState("")
  const [examples, setExamples] = useState<ExampleSummary[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    if (!token) {
      router.replace("/signup")
    }
  }, [router])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setIsLoading(true)
      setErrorMsg(null)

      try {
        const endpoint = withQuery(API_ENDPOINTS.GET_EXAMPLES, {
          q: searchQuery || undefined,
          page: 1,
        })

        const data = await apiFetch<{ examples: ExampleSummary[] }>(endpoint, {
          auth: true,
        })

        if (!cancelled) {
          setExamples(Array.isArray(data?.examples) ? data.examples : [])
        }
      } catch (err) {
        console.error("[policies] fetch error:", err)
        if (!cancelled) {
          const msg =
            err instanceof Error && err.message.includes("API Error")
              ? "정책 목록을 불러오는 중 서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요."
              : "정책 목록을 불러오지 못했어요. 네트워크 상태를 확인해 주세요."
          setErrorMsg(msg)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  const filteredExamples = useMemo(() => {
    if (selectedCategory === "전체") return examples
    return examples.filter((ex) => ex.categories?.includes(selectedCategory))
  }, [examples, selectedCategory])

  const handleCardClick = (id: number) => {
    router.push(`/policies/${id}`)
  }

  const handleLike = (id: number) => {
    // TODO: backend like endpoint not implemented
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleBookmark = (id: number) => {
    // TODO: backend bookmark endpoint not implemented
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }))
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
        {isLoading && (
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        )}

        {!isLoading && errorMsg && (
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-gray-700">{errorMsg}</p>
            <div className="mt-3">
              <Button variant="outline" onClick={() => setSearchQuery((q) => q)}>
                다시 시도
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !errorMsg && filteredExamples.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 text-center">
            <p className="text-sm text-gray-500">검색 결과가 없어요.</p>
          </div>
        )}

        {!isLoading &&
          !errorMsg &&
          filteredExamples.length > 0 &&
          filteredExamples.map((example) => (
            <Card key={example.id} className="overflow-hidden border-0 shadow-sm bg-white rounded-xl">
              <div onClick={() => handleCardClick(example.id)} className="cursor-pointer">
                <div className="relative aspect-[2/1] bg-gradient-to-br from-[#e8deff] to-[#d3c1ff]/30">
                  <div className="flex h-full items-center justify-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-[#d3c1ff]">
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="12"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity="0.5"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.5" />
                      <path d="M4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                    {example.categories?.slice(0, 2).map((cat) => (
                      <span key={cat} className="rounded bg-[#c5b0ff] px-2 py-0.5 text-xs font-medium text-white">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 p-3">
                  <h3 className="text-pretty text-[14px] font-semibold leading-snug text-black">{example.title}</h3>
                  <p className="text-sm text-gray-500">{example.region}</p>
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
                      <Heart
                        className={`h-[17px] w-[17px] ${liked[example.id] ? "fill-[#b69df8] text-[#b69df8]" : ""}`}
                      />
                      <span className="text-[13px]">0</span>
                    </button>
                    <button className="flex items-center gap-1 transition-colors hover:text-[#b69df8]">
                      <MessageCircle className="h-[17px] w-[17px]" />
                      <span className="text-[13px]">0</span>
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
                        bookmarked[example.id] ? "fill-[#b69df8] text-[#b69df8]" : "text-[#929292]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
          ))}
      </div>

      <button
        onClick={() => router.push("/policies/new")}
        className="fixed bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#b69df8] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
