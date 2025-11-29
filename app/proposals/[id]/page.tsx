"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Heart } from "lucide-react"
import { requireAuth } from "@/lib/auth"

// Mock data - TODO: Replace with API call
const mockProposal = {
  id: 1,
  title: "안남면 마을도서관 버스 노선 확충 제안합니다.",
  content: "옥천읍에서 더큰 읍으로 다니기가 힘들어요",
  tags: [
    { id: 1, name: "교통" },
    { id: 2, name: "교육" },
  ],
  author: {
    nickname: "옥천시람",
    avatar: "",
    region: "안내면",
  },
  agrees: 160,
  views: 135,
  createdAt: "3일 전",
  isAgreed: false,
  sections: {
    problem: "옥천읍에서 더큰 읍으로 다니기가 힘들어요",
    relatedPolicies: [
      {
        id: 1,
        region: "대전",
        title: "대전시 공용 자전거 '타슈' 공영차 번호 제도",
        category: "교통",
      },
    ],
    solution:
      "대전시 타슈 사례를 보면 OO 예산으로 OO명의 이용 증가하고 팀니다. 우수사례에서 보였듯이 옥천읍에도 공용 자전거를 학교 근처에 설치해주셨으면",
    expectedEffects: "월별 배경과 이동할 수 있어서 삶의 질이 높아져요",
  },
}

const mockRelatedPolicies = [
  {
    id: 1,
    region: "대전",
    title: "대전시 공용 자전거 '타슈' 공영차 번호 제도",
    category: "교통",
  },
  {
    id: 2,
    region: "대전",
    title: "대전시 공용 자전거 '타슈' 공영차 번호 제도",
    category: "교통",
  },
]

const mockComments = [
  {
    id: 1,
    author: "옥이네",
    content: "우리 동네에도 있으면 정말 좋겠어요!",
    likes: 10,
    createdAt: "2일 전",
    isLiked: false,
  },
  {
    id: 2,
    author: "옥이네",
    content: "우리 동네에도 있으면 정말 좋겠어요!",
    likes: 10,
    createdAt: "2일 전",
    isLiked: false,
  },
]

export default function ProposalDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [proposal, setProposal] = useState(mockProposal)
  const [comments, setComments] = useState(mockComments)

  useEffect(() => {
    requireAuth(router)
  }, [router])

  const handleAgree = () => {
    setProposal((prev) => ({
      ...prev,
      isAgreed: !prev.isAgreed,
      agrees: prev.isAgreed ? prev.agrees - 1 : prev.agrees + 1,
    }))
    // TODO: Call API to update agree status
  }

  const handleCommentLike = (commentId: number) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 } : c,
      ),
    )
    // TODO: Call API to update comment like
  }

  const handlePolicyClick = (policyId: number) => {
    // TODO: Navigate to the policy example detail page
    router.push(`/policies/${policyId}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <button onClick={() => router.back()} className="text-foreground">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">정책 제안</h1>
      </header>

      <div className="space-y-6 px-4 pt-6">
        {/* Tags */}
        <div className="flex gap-2">
          {proposal.tags.map((tag) => (
            <span key={tag.id} className="rounded-full bg-[#b8a4e8] px-4 py-1.5 text-sm font-medium text-[#1a1a1a]">
              {tag.name}
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
              <p className="font-medium text-[#1a1a1a]">{proposal.author.nickname}</p>
              <p className="text-sm text-[#999999]">{proposal.createdAt}</p>
            </div>
          </div>
          <div className="text-right text-sm text-[#999999]">
            <p>동의 {proposal.agrees}</p>
            <p>조회 {proposal.views}</p>
          </div>
        </div>

        {/* Agree Button */}
        <button
          onClick={handleAgree}
          className={`w-full rounded-xl py-4 text-center font-medium transition-all duration-300 ease-out active:scale-95 ${
            proposal.isAgreed
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
            <p className="text-base leading-relaxed text-[#666666]">{proposal.sections.problem}</p>
          </div>

          {/* Section 2: Related Policy Examples */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">2. 관련 정책 사례</h3>
            <div className="space-y-3">
              {proposal.sections.relatedPolicies.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => handlePolicyClick(policy.id)}
                  className="w-full rounded-xl bg-white p-4 text-left transition-shadow hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-[#f5f5f5] px-2.5 py-1 text-xs font-medium text-[#1a1a1a]">
                      {policy.region}
                    </span>
                    <span className="rounded-full bg-[#b8a4e8] px-2.5 py-1 text-xs font-medium text-[#1a1a1a]">
                      {policy.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-snug text-[#1a1a1a]">{policy.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Solution */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">3. 해결 방안 제시</h3>
            <p className="text-base leading-relaxed text-[#666666]">{proposal.sections.solution}</p>
          </div>

          {/* Section 4: Expected Effects */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#1a1a1a]">4. 기대 효과</h3>
            <p className="text-base leading-relaxed text-[#666666]">{proposal.sections.expectedEffects}</p>
          </div>
        </div>

        {/* More Related Policies */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">관련 정책 더보기</h3>
          <div className="space-y-3">
            {mockRelatedPolicies.map((policy) => (
              <button
                key={policy.id}
                onClick={() => handlePolicyClick(policy.id)}
                className="w-full rounded-xl bg-[#f5f5f5] p-4 text-left transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-white px-2.5 py-1 text-xs font-medium text-[#1a1a1a]">
                    {policy.region}
                  </span>
                  <span className="rounded-full bg-[#b8a4e8] px-2.5 py-1 text-xs font-medium text-[#1a1a1a]">
                    {policy.category}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug text-[#1a1a1a]">{policy.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-[#1a1a1a]">댓글</h3>
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
        </div>
      </div>
    </div>
  )
}
