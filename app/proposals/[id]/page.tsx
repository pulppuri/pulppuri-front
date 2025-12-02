"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Heart, Loader2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { fetchProposalDetail } from "@/lib/api"
import type { ProposalDetail } from "@/types"

export default function ProposalDetailPage() {
  const router = useRouter()
  const params = useParams()

  const [proposal, setProposal] = useState<ProposalDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  const [isAgreed, setIsAgreed] = useState(false)
  const [agreeCount, setAgreeCount] = useState(0)
  const [comments, setComments] = useState<
    { id: number; author: string; content: string; likes: number; createdAt: string; isLiked: boolean }[]
  >([])

  useEffect(() => {
    requireAuth(router)
  }, [router])

  useEffect(() => {
    if (!requireAuth(router)) return

    const rawId = params.id
    if (!rawId || Array.isArray(rawId)) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    const numericId = Number.parseInt(rawId, 10)
    if (isNaN(numericId)) {
      setNotFound(true)
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadProposal() {
      setIsLoading(true)
      setErrorMsg(null)
      setNotFound(false)

      try {
        const data = await fetchProposalDetail(numericId)
        if (cancelled) return

        if (!data.proposal) {
          setNotFound(true)
          return
        }

        setProposal(data.proposal)
        setAgreeCount(data.proposal.agrees || data.proposal.likes || 0)
      } catch (err) {
        if (cancelled) return
        if (err instanceof Error && err.message.includes("404")) {
          setNotFound(true)
        } else if (err instanceof Error && err.message.includes("API Error")) {
          setErrorMsg("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
          console.error("[v0] Server error:", err.message)
        } else {
          setErrorMsg("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProposal()

    return () => {
      cancelled = true
    }
  }, [params.id, retryKey, router])

  const handleAgree = () => {
    setIsAgreed((prev) => {
      setAgreeCount((c) => (prev ? Math.max(0, c - 1) : c + 1))
      return !prev
    })
    // TODO: backend endpoint not implemented
  }

  const handleCommentLike = (commentId: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 } : c,
      ),
    )
    // TODO: backend endpoint not implemented
  }

  const handlePolicyClick = (policyId: number) => {
    router.push(`/policies/${policyId}`)
  }

  const formatDate = (value?: string | number) => {
    if (!value) return ""
    try {
      const date = new Date(typeof value === "number" ? value : value)
      if (isNaN(date.getTime())) return ""
      return date.toLocaleDateString("ko-KR")
    } catch {
      return ""
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3">
          <button onClick={() => router.push("/proposals")} className="text-foreground">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">정책 제안</h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#b69df8]" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3">
          <button onClick={() => router.push("/proposals")} className="text-foreground">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">정책 제안</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="text-center text-gray-500">존재하지 않는 제안입니다</p>
          <button
            onClick={() => router.push("/proposals")}
            className="mt-4 rounded-lg bg-[#b69df8] px-4 py-2 text-sm text-white hover:bg-[#a88def]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3">
          <button onClick={() => router.push("/proposals")} className="text-foreground">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">정책 제안</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="text-center text-sm text-red-500">{errorMsg}</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-4 rounded-lg bg-[#b69df8] px-4 py-2 text-sm text-white hover:bg-[#a88def]"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!proposal) return null

  const solutionText = proposal.method || proposal.solution || "내용이 없습니다."
  const effectText = proposal.effect || proposal.expectedEffect || "내용이 없습니다."
  const authorName = proposal.nickname || proposal.author?.nickname || "익명"

  return (
    <div className="flex min-h-screen flex-col bg-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <button onClick={() => router.push("/proposals")} className="text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">정책 제안</h1>
      </header>

      <div className="space-y-6 px-4 pt-6">
        <div className="flex gap-2">
          {proposal.categories?.map((cat, idx) => (
            <span key={idx} className="rounded-full bg-[#b8a4e8] px-4 py-1.5 text-sm font-medium text-[#1a1a1a]">
              {cat}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold leading-tight text-[#1a1a1a]">{proposal.title}</h2>

        {/* Author Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#d4c5f0]" />
            <div>
              <p className="font-medium text-[#1a1a1a]">{authorName}</p>
              <p className="text-sm text-[#999999]">{formatDate(proposal.created_at)}</p>
            </div>
          </div>
          <div className="text-right text-sm text-[#999999]">
            <p>동의 {agreeCount}</p>
            <p>조회 {proposal.views || 0}</p>
          </div>
        </div>

        {/* Agree Button */}
        <button
          onClick={handleAgree}
          className={`w-full rounded-xl py-4 text-center font-medium transition-all duration-300 ease-out active:scale-95 ${
            isAgreed
              ? "bg-[#c8b6e2] text-[#1a1a1a] shadow-md"
              : "bg-[#ddd0f0] text-[#1a1a1a] hover:bg-[#d4c5f0] hover:shadow-lg active:shadow-md"
          }`}
        >
          동의해요
        </button>

        {/* Section Container */}
        <div className="space-y-6 rounded-2xl bg-[#f5f5f5] p-5">
          {/* Section 1: Problem Definition */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">1. 문제 정의</h3>
            <p className="text-base leading-relaxed text-[#666666]">{proposal.problem || "내용이 없습니다."}</p>
          </div>

          {/* Section 2: Related Policy Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">2. 관련 정책 사례</h3>
            {proposal.eid ? (
              <button
                onClick={() => router.push(`/policies/${proposal.eid}`)}
                className="w-full rounded-xl border border-[#b4a0e5] bg-white py-3 text-center font-medium text-[#7c6aad] hover:bg-[#f8f5ff] transition-colors"
              >
                관련 정책 사례 보러가기
              </button>
            ) : (
              <p className="text-sm text-[#999999]">관련 정책 사례가 아직 없습니다.</p>
            )}
          </div>

          {/* Section 3: Solution */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">3. 해결 방안 제시</h3>
            <p className="text-base leading-relaxed text-[#666666]">{solutionText}</p>
          </div>

          {/* Section 4: Expected Effects */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">4. 기대 효과</h3>
            <p className="text-base leading-relaxed text-[#666666]">{effectText}</p>
          </div>
        </div>

        {/* More Related Policies - TODO: backend not implemented */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">관련 정책 더보기</h3>
          <p className="text-sm text-[#999999]">관련 정책이 아직 없습니다.</p>
        </div>

        {/* Comments Section - TODO: backend not implemented */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">댓글</h3>
          {comments.length === 0 ? (
            <p className="text-sm text-[#999999]">댓글이 아직 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-xl bg-[#fafafa] p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#e0e0e0]" />
                    <div>
                      <p className="font-medium text-[#1a1a1a]">{comment.author}</p>
                      <p className="text-xs text-[#999999]">{comment.createdAt}</p>
                    </div>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-[#1a1a1a]">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className="flex items-center gap-1.5 text-sm text-[#999999] transition-colors hover:text-[#666666]"
                    >
                      <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="text-sm text-[#999999] transition-colors hover:text-[#666666]">답글</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
