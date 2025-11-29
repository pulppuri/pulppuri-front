"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Heart, MessageCircle, ThumbsUp } from "lucide-react"

const MOCK_EXAMPLE_DETAIL = {
  id: 1,
  rid: 1,
  uid: 1,
  title: "'청년 살기 좋은 지역으로' 함양군 청년 특성 강화한 정책 펼쳐",
  content: "청년들을 위한 주거 지원과 일자리 창출 정책",
  reference: "함양군",
  read_cnt: 135,
  created_at: Date.now(),
  updated_at: Date.now(),
  tags: [{ id: 2, name: "청년" }],
  likes: 50,
  comments: 50,
  isLiked: false,
  isBookmarked: false,
  imageUrl: "/images/image.png",
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
    housing: ["청년 1인 가구를 위한 월세 지원(최대 20만 원, 1년간)", "청년 전용 공공임대주택 100세대 공급"],
    startup: ["예비창업자에게 최대 1,000만 원 창업 초기자금 및 멘토 제공", "공영 시설 공공 오피스·창업공간 무료 이용"],
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

const MOCK_EXAMPLES_DETAIL: Record<number, typeof MOCK_EXAMPLE_DETAIL> = {
  1: MOCK_EXAMPLE_DETAIL,
  2: {
    id: 2,
    rid: 1,
    uid: 2,
    title: "진짜 크게 준비해야...케데헌 열풍, 2회 김천김밥축제 대박 예열",
    content: "김천김밥축제를 통한 지역 문화 활성화 정책",
    reference: "김천시",
    read_cnt: 220,
    created_at: Date.now(),
    updated_at: Date.now(),
    tags: [{ id: 3, name: "문화" }],
    likes: 50,
    comments: 50,
    isLiked: false,
    isBookmarked: false,
    imageUrl: "/images/image.png",
    fullContent:
      "김천시가 지역 특산물인 김밥을 활용한 대규모 문화축제를 개최하여 지역 경제 활성화와 관광 산업 육성을 추진하고 있습니다.",
    detailedContent: `
## 축제 개요

- 제2회 김천김밥축제가 오는 5월 김천시 중앙공원 일대에서 개최
- 3일간 진행되며 약 10만 명의 방문객 예상
- 다양한 김밥 요리 경연대회와 체험 프로그램 운영

## 주요 프로그램

### 1. 김밥 요리 경연대회

- 전국 요리사들이 참여하는 창작 김밥 경연
- 우승자에게는 상금 500만 원과 김천시 홍보대사 위촉

### 2. 시민 참여 프로그램

- 가족 단위 김밥 만들기 체험
- 김천 특산물을 활용한 퓨전 김밥 시식회
- 지역 농산물 직거래 장터 운영

### 3. 문화 공연

- K-POP 아티스트 초청 공연
- 지역 문화예술단 공연
- 야간 불꽃놀이 행사
    `,
    targetAudience: ["김천시민 및 인근 지역 주민", "전국의 요리 애호가 및 관광객", "가족 단위 방문객"],
    mainContent: {
      housing: [],
      startup: [],
      mentalHealth: [],
    },
    articleUrl: "https://example.com/article/gimcheon-festival",
    relatedProposals: [
      {
        id: 3,
        user: { nickname: "옥천음식러버" },
        content: "옥천도 지역 특산물로 축제 만들면 좋겠어요!",
        likes: 30,
        comments: 20,
        date: "2025.11.15",
      },
    ],
    commentsList: [
      {
        id: 1,
        user: { nickname: "김밥러버" },
        content: "작년 축제 정말 재미있었어요! 올해도 기대됩니다!",
        likes: 15,
        date: "1일 전",
      },
      {
        id: 2,
        user: { nickname: "여행매니아" },
        content: "가족과 함께 꼭 방문하고 싶네요",
        likes: 8,
        date: "3일 전",
      },
    ],
  },
}

export default function PolicyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [example, setExample] = useState<typeof MOCK_EXAMPLE_DETAIL | null>(null)
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({})
  const [proposalLikes, setProposalLikes] = useState<Record<number, { liked: boolean; count: number }>>({})

  useEffect(() => {
    const id = Number(params.id)
    const exampleData = MOCK_EXAMPLES_DETAIL[id]

    if (exampleData) {
      setExample(exampleData)

      const initialProposalLikes: Record<number, { liked: boolean; count: number }> = {}
      exampleData.relatedProposals.forEach((proposal: any) => {
        initialProposalLikes[proposal.id] = { liked: false, count: proposal.likes }
      })
      setProposalLikes(initialProposalLikes)
    }
  }, [params.id])

  if (!example) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

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
      window.open(example.articleUrl, "_blank")
    }
  }

  const handleProposePolicy = () => {
    const categoryTag = example.tags?.[0]?.name || ""
    router.push(`/proposals/new?category=${encodeURIComponent(categoryTag)}`)
  }

  const handleProposalClick = (proposalId: number) => {
    router.push(`/policies/${proposalId}`)
  }

  const handleProposalLike = (proposalId: number, e: React.MouseEvent) => {
    e.stopPropagation()

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
    e.stopPropagation()
    router.push(`/proposals/${proposalId}`)
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background px-4 py-3">
        <button onClick={() => router.back()} className="rounded-lg p-1 hover:bg-muted">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-center flex-1 text-base font-semibold">정책 사례</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {example.imageUrl ? (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={example.imageUrl || "/placeholder.svg"}
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
        <div className="flex gap-2">
          {example.tags?.map((tag: any) => (
            <span key={tag.id} className="rounded-full bg-[#b4a0e5] px-3 py-1 text-sm font-medium text-white">
              {tag.name}
            </span>
          ))}
        </div>

        <h2 className="text-pretty text-xl font-bold leading-tight">{example.title}</h2>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{new Date(example.created_at).toLocaleDateString("ko-KR")}</span>
          <span>조회 {example.read_cnt}</span>
        </div>

        <p className="text-base leading-relaxed">{example.fullContent}</p>

        <div className="space-y-5 rounded-2xl bg-[#f5f5f5] p-5">
          {/* Policy Target */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#b4a0e5] p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-base font-bold">정책 대상</h3>
            </div>
            <ul className="space-y-1 text-sm leading-relaxed">
              {example.targetAudience.map((item: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-[#b4a0e5] p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-base font-bold">주요 내용</h3>
            </div>

            {example.mainContent.housing.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">1. 주거 안정 지원</h4>
                <ul className="space-y-1 text-sm leading-relaxed">
                  {example.mainContent.housing.map((item: string, index: number) => (
                    <li key={index} className="flex gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {example.mainContent.startup.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">2. 창업 지원</h4>
                <ul className="space-y-1 text-sm leading-relaxed">
                  {example.mainContent.startup.map((item: string, index: number) => (
                    <li key={index} className="flex gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {example.mainContent.mentalHealth.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">3. 마음건강 프로그램</h4>
                <ul className="space-y-1 text-sm leading-relaxed">
                  {example.mainContent.mentalHealth.map((item: string, index: number) => (
                    <li key={index} className="flex gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleViewArticle}
            className="flex-1 rounded-xl border-2 py-6 font-semibold hover:bg-muted bg-transparent"
          >
            기사 원문 보러 가기
          </Button>
        </div>

        <Button
          onClick={handleProposePolicy}
          className="w-full rounded-xl bg-[#b4a0e5] py-6 text-base font-semibold text-white hover:bg-[#a090d5]"
        >
          이 사례로 새로운 정책 제안하기
        </Button>

        {example.relatedProposals.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">이 정책을 참고한 제안</h3>
            <div className="space-y-3">
              {example.relatedProposals.map((proposal: any) => (
                <div
                  key={proposal.id}
                  onClick={() => handleProposalClick(proposal.id)}
                  className="cursor-pointer space-y-3 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-[#e5e5e5]" />
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{proposal.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                      onClick={(e) => handleProposalLike(proposal.id, e)}
                      className="flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      <Heart
                        className={`h-4 w-4 ${proposalLikes[proposal.id]?.liked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      <span>{proposalLikes[proposal.id]?.count || proposal.likes}</span>
                    </button>
                    <button
                      onClick={(e) => handleProposalComment(proposal.id, e)}
                      className="flex items-center gap-1 transition-colors hover:text-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{proposal.comments}</span>
                    </button>
                    <span className="ml-auto">{proposal.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {example.commentsList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">댓글</h3>
            </div>
            <div className="space-y-3">
              {example.commentsList.map((comment: any) => (
                <div key={comment.id} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#e5e5e5]" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.user.nickname}</span>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ThumbsUp
                            className={`h-3.5 w-3.5 ${commentLikes[comment.id] ? "fill-[#b4a0e5] text-[#b4a0e5]" : ""}`}
                          />
                          <span>{comment.likes + (commentLikes[comment.id] ? 1 : 0)}</span>
                        </button>
                        <button className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                          답글
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
