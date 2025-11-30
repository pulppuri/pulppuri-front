"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, MessageCircle, RefreshCw } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { fetchExampleDetail } from "@/lib/api"
import type { ExampleDetail } from "@/types"

const PolicyDetailPage = () => {
  const router = useRouter()
  const params = useParams()

  const [example, setExample] = useState<ExampleDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  // UI 토글 상태 (백엔드 미구현)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!requireAuth(router)) return

    const rawId = params.id
    const id = Number(rawId)

    // 숫자 변환 실패 시 notFound
    if (isNaN(id) || id <= 0) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setErrorMsg(null)

      try {
        const data = await fetchExampleDetail(id)

        if (cancelled) return

        if (!data || !data.example) {
          setNotFound(true)
        } else {
          setExample(data.example)
          setNotFound(false)
        }
      } catch (err) {
        if (cancelled) return

        if (err instanceof Error && err.message.includes("API Error")) {
          if (err.message.includes("404")) {
            setNotFound(true)
          } else {
            setErrorMsg("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.")
          }
        } else {
          setErrorMsg("네트워크 상태를 확인하고 다시 시도해 주세요.")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [params.id, router, retryKey])

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1)
  }, [])

  const handleLike = () => {
    setLiked((prev) => !prev)
    // TODO: backend endpoint not implemented
  }

  const handleBookmark = () => {
    setBookmarked((prev) => !prev)
    // TODO: backend endpoint not implemented
  }

  const handleCommentLike = (commentId: number) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }))
    // TODO: backend endpoint not implemented
  }

  const handleViewArticle = () => {
    // TODO: backend에서 articleUrl 제공 시 연동
    alert("기사 원문 링크가 아직 제공되지 않습니다.")
  }

  const handleProposePolicy = () => {
    const categoryTag = example?.categories?.[0] || ""
    router.push(`/proposals/new?category=${encodeURIComponent(categoryTag)}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
          <div className="w-8" />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#b4a0e5] border-t-transparent" />
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
          <div className="w-8" />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground">{errorMsg}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !example) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
          <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
          <div className="w-8" />
        </div>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-lg font-medium">존재하지 않는 정책입니다</p>
            <Button onClick={() => router.push("/policies")} variant="outline">
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
        <div className="w-8" />
      </div>

      {/* 썸네일 영역 */}
      {example.thumbnail ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={example.thumbnail || "/placeholder.svg"}
            alt={example.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="relative aspect-[16/9] bg-gradient-to-br from-[#e8deff] to-[#d3c1ff]/30">
          <div className="flex h-full items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-[#d3c1ff]">
              <rect x="4" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.4" />
              <path d="M4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
          </div>
        </div>
      )}

      <div className="space-y-6 px-4 pt-5">
        <div className="flex flex-wrap gap-2">
          {example.categories?.map((cat, idx) => (
            <span key={idx} className="rounded-full bg-[#b4a0e5] px-3 py-1 text-sm font-medium text-white">
              {cat}
            </span>
          ))}
        </div>

        <h2 className="text-pretty text-xl font-bold leading-tight">{example.title}</h2>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {example.created_at && <span>{new Date(example.created_at).toLocaleDateString("ko-KR")}</span>}
          {example.read_cnt !== undefined && <span>조회 {example.read_cnt}</span>}
          {example.region && <span>{example.region}</span>}
        </div>

        {/* 본문 컨텐츠 */}
        {(example.content || example.body) && (
          <div className="space-y-4 rounded-2xl bg-[#f5f5f5] p-5">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{example.content || example.body}</p>
          </div>
        )}

        {/* 기사 원문 버튼 */}
        {example.reference && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleViewArticle}
              className="flex-1 rounded-xl border-2 py-6 font-semibold hover:bg-muted bg-transparent"
            >
              기사 원문 보러 가기
            </Button>
          </div>
        )}

        {/* 정책 제안하기 버튼 */}
        <Button
          onClick={handleProposePolicy}
          className="w-full rounded-xl bg-[#b4a0e5] py-6 text-base font-semibold text-white hover:bg-[#a090d5]"
        >
          이 사례로 새로운 정책 제안하기
        </Button>

        {/* 좋아요/북마크 UI (백엔드 미구현) */}
        <div className="flex items-center justify-center gap-6 py-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{(example.likes || 0) + (liked ? 1 : 0)}</span>
          </button>
          <button
            onClick={handleBookmark}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle className={`h-6 w-6 ${bookmarked ? "fill-[#b4a0e5] text-[#b4a0e5]" : ""}`} />
            <span>{example.comments || 0}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PolicyDetailPage
