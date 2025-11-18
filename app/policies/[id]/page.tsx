"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, MessageCircle, ThumbsUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { Example } from "@/types"

// Mock detailed example data
const MOCK_EXAMPLE_DETAIL: Example & {
  fullContent: string
  detailedContent?: string // Added markdown content field from backend
  targetAudience: string[]
  mainContent: {
    housing: string[]
    startup: string[]
    mentalHealth: string[]
  }
  articleUrl?: string
  relatedProposals: Array<{
    id: number
    user: { nickname: string; avatar?: string }
    content: string
    likes: number
    comments: number
    date: string
  }>
  commentsList: Array<{
    id: number
    user: { nickname: string; avatar?: string }
    content: string
    likes: number
    date: string
  }>
} = {
  id: 1,
  rid: 1,
  uid: 1,
  title: "'청년 살기 좋은 지역으로' 함양군 청년 특성 강화한 정책 펼쳐",
  content: "청년들을 위한 주거 지원과 일자리 창출 정책",
  reference: "함양군",
  read_cnt: 135,
  created_at: Date.now(),
  updated_at: Date.now(),
  tags: [
    { id: 2, name: "청년" },
  ],
  likes: 50,
  comments: 50,
  isLiked: false,
  isBookmarked: false,
  fullContent: "◯◯군이 지역 청년들의 안정적인 지원을 듣기 위해 '청년 지원정책' 종합정책을 올해 3월부터 시행한다.",
  detailedContent: `
## 정책 대상

- 만 19세에서 34세 이하의 ◯◯ 거주 청년
- 취업 준비 중이거나 사회초년생, 창업을 계획 중인 청년 등
- 연소득 기준 이하 청년들도 포함하여 폭넓게 참여 가능

## 주요 내용

### 1. 주거 안정 지원

- 청년 1인 가구를 위한 월세 지원(최대 20만 원, 1년간)
- 청년 전용 공공임대주택 100세대 공급

### 2. 창업 지원

- 예비창업자에게 최대 1,000만 원 창업 초기자금 및 멘토 제공
- 공영 시설 공공 오피스·창업공간 무료 이용

### 3. 마음건강 프로그램

- 취업 스트레스와 불안 예술을 위한 상담심리 무료 제공(연 5회)
- 또래 커뮤니티 프로그램 운영으로 사회적 관계망 형성 지원
  `,
  targetAudience: [
    "만 19세에서 34세 이하의 ◯◯ 거주 청년",
    "취업 준비 중이거나 사회초년생, 창업을 계획 중인 청년 등",
    "연소득 기준 이하 청년들도 포함하여 폭넓게 참여 가능",
  ],
  mainContent: {
    housing: [
      "청년 1인 가구를 위한 월세 지원(최대 20만 원, 1년간)",
      "청년 전용 공공임대주택 100세대 공급",
    ],
    startup: [
      "예비창업자에게 최대 1,000만 원 창업 초기자금 및 멘토 제공",
      "공영 시설 공공 오피스·창업공간 무료 이용",
    ],
    mentalHealth: [
      "취업 스트레스와 불안 예술을 위한 상담심리 무료 제공(연 5회)",
      "또래 커뮤니티 프로그램 운영으로 사회적 관계망 형성 지원",
    ],
  },
  articleUrl: "https://example.com/article/youth-policy",
  relatedProposals: [
    {
      id: 1,
      user: { nickname: "옥천군민" },
      content: "옥천군에도 청년 창업 지원 확충 바랍니다.",
      likes: 50,
      comments: 50,
      date: "2025.11.01",
    },
    {
      id: 2,
      user: { nickname: "청년1호" },
      content: "청년 1인 가구 월세 지원 정책 어떠기요?",
      likes: 50,
      comments: 50,
      date: "2025.11.01",
    },
  ],
  commentsList: [
    {
      id: 1,
      user: { nickname: "옥이네" },
      content: "우리 동네에도 있으면 정말 좋겠어요!",
      likes: 10,
      date: "2일 전",
    },
    {
      id: 2,
      user: { nickname: "옥이네" },
      content: "우리 동네에도 있으면 정말 좋겠어요!",
      likes: 10,
      date: "2일 전",
    },
    {
      id: 3,
      user: { nickname: "옥이네" },
      content: "우리 동네에도 있으면 정말 좋겠어요!",
      likes: 10,
      date: "2일 전",
    },
  ],
}

export default function PolicyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [example, setExample] = useState(MOCK_EXAMPLE_DETAIL)
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})
  const [proposalLikes, setProposalLikes] = useState<Record<number, { liked: boolean; count: number }>>({})

  useEffect(() => {
    // TODO: Fetch example detail from backend using params.id
    // The backend should return detailedContent as markdown string
    // const fetchExampleDetail = async () => {
    //   const response = await api.get(`/examples/${params.id}`)
    //   setExample(response.data)
    // }
    // fetchExampleDetail()
    
    const initialProposalLikes: Record<number, { liked: boolean; count: number }> = {}
    example.relatedProposals.forEach((proposal) => {
      initialProposalLikes[proposal.id] = { liked: false, count: proposal.likes }
    })
    setProposalLikes(initialProposalLikes)
  }, [params.id])

  const handleLike = () => {
    setExample({
      ...example,
      likes: (example.likes || 0) + (example.isLiked ? -1 : 1),
      isLiked: !example.isLiked,
    })
    // TODO: API call to backend to like/unlike
  }

  const handleCommentLike = (commentId: number) => {
    setCommentLikes({
      ...commentLikes,
      [commentId]: !commentLikes[commentId],
    })
    // TODO: API call to backend to like/unlike comment
  }

  const handleViewArticle = () => {
    if (example.articleUrl) {
      // TODO: Open article URL from backend
      window.open(example.articleUrl, "_blank")
    }
  }

  const handleProposePolicy = () => {
    const categoryTag = example.tags?.[0]?.name || ""
    router.push(`/proposals/new?category=${encodeURIComponent(categoryTag)}`)
  }

  const handleProposalClick = (proposalId: number) => {
    // TODO: Fetch the policy example ID that this proposal references from backend
    // const response = await api.get(`/proposals/${proposalId}/referenced-example`)
    // router.push(`/policies/${response.data.exampleId}`)
    
    // For now, navigate to a mock policy detail page
    router.push(`/policies/${proposalId}`)
  }

  const handleProposalLike = (proposalId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking like button
    
    setProposalLikes((prev) => {
      const current = prev[proposalId]
      return {
        ...prev,
        [proposalId]: {
          liked: !current.liked,
          count: current.count + (current.liked ? -1 : 1),
        },
      }
    })
    // TODO: API call to backend to like/unlike proposal
  }

  const handleProposalComment = (proposalId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking comment button
    // TODO: Navigate to proposal detail page or open comment section
    router.push(`/proposals/${proposalId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#e8deff] to-[#d3c1ff]/30">
        <div className="flex h-full items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-[#d3c1ff]">
            <rect x="4" y="4" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" opacity="0.4" />
            <path d="M4 15l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pt-5">
        {/* Tags - Changed to purple background */}
        <div className="flex gap-2">
          {example.tags?.map((tag) => (
            <span key={tag.id} className="rounded-md bg-[#c5b0ff] px-3 py-1 text-sm font-medium text-white">
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-pretty text-xl font-bold leading-tight">{example.title}</h2>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{new Date(example.created_at).toLocaleDateString("ko-KR")}</span>
          <span>조회 {example.read_cnt}</span>
        </div>

        {/* Summary */}
        <p className="text-[15px] leading-relaxed text-foreground/90">{example.fullContent}</p>

        {example.detailedContent && (
          <div className="markdown-content rounded-lg bg-muted/30 p-4">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-4 flex items-center gap-1.5 text-sm font-bold first:mt-0">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-[#c5b0ff] text-xs text-white">
                      📋
                    </span>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-1 mt-3 font-semibold text-[15px]">{children}</h3>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 space-y-1 pl-6 text-[15px] last:mb-0">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="list-disc leading-relaxed">{children}</li>
                ),
                p: ({ children }) => (
                  <p className="mb-2 text-[15px] leading-relaxed last:mb-0">{children}</p>
                ),
              }}
            >
              {example.detailedContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Fallback: Show structured content if no markdown */}
        {!example.detailedContent && (
          <div className="space-y-4 rounded-lg bg-muted/30 p-4">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#c5b0ff] text-xs text-white">
                  📋
                </span>
                정책 대상
              </h3>
              <ul className="space-y-1 pl-6 text-[15px]">
                {example.targetAudience.map((item, idx) => (
                  <li key={idx} className="list-disc leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#c5b0ff] text-xs text-white">
                  📌
                </span>
                주요 내용
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="mb-1 font-semibold text-[15px]">1. 주거 안정 지원</p>
                  <ul className="space-y-1 pl-4 text-[15px]">
                    {example.mainContent.housing.map((item, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-[15px]">2. 창업 지원</p>
                  <ul className="space-y-1 pl-4 text-[15px]">
                    {example.mainContent.startup.map((item, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-semibold text-[15px]">3. 마음건강 프로그램</p>
                  <ul className="space-y-1 pl-4 text-[15px]">
                    {example.mainContent.mentalHealth.map((item, idx) => (
                      <li key={idx} className="list-disc leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Link */}
        <div className="flex justify-end">
          <button
            onClick={handleViewArticle}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 active:bg-gray-100"
          >
            기사 원문 보러 가기
          </button>
        </div>

        {/* Propose Policy Button - Darker purple color */}
        <Button
          onClick={handleProposePolicy}
          className="w-full rounded-lg bg-[#b89dff] py-6 text-base font-semibold text-white hover:bg-[#a88dff]"
        >
          이 사례로 새로운 정책 제안하기
        </Button>

        {/* Related Proposals Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold">이 정책을 참고한 제안</h3>
          <div className="space-y-3">
            {example.relatedProposals.map((proposal) => (
              <button
                key={proposal.id}
                onClick={() => handleProposalClick(proposal.id)}
                className="w-full rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {proposal.user.nickname[0]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[15px] leading-relaxed">{proposal.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <button
                        onClick={(e) => handleProposalLike(proposal.id, e)}
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            proposalLikes[proposal.id]?.liked ? "fill-primary text-primary" : ""
                          }`}
                        />
                        {proposalLikes[proposal.id]?.count || proposal.likes}
                      </button>
                      <button
                        onClick={(e) => handleProposalComment(proposal.id, e)}
                        className="flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {proposal.comments}
                      </button>
                      <span>{proposal.date}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-bold">댓글</h3>
          <div className="space-y-3">
            {example.commentsList.map((comment) => (
              <div key={comment.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-semibold text-muted-foreground">{comment.user.nickname[0]}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{comment.user.nickname}</span>
                      <span className="text-xs text-muted-foreground">{comment.date}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ThumbsUp
                          className={`h-4 w-4 ${commentLikes[comment.id] ? "fill-primary text-primary" : ""}`}
                        />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
