"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ChevronLeft, Bell, Shield, HelpCircle, LogOut, MessageCircle, Heart } from 'lucide-react'
import { BottomNav } from "@/components/bottom-nav"

export default function MyPage() {
  const router = useRouter()
  const [notificationEnabled, setNotificationEnabled] = useState(true)

  // Mock user data - TODO: Replace with actual user data from backend
  const user = {
    id: 1,
    nickname: "옥천옥천",
    region: "옥천읍",
    interests: ["청년", "주거"],
    proposalCount: 3,
    commentCount: 12,
    likeCount: 47
  }

  // Mock posts data - TODO: Fetch from backend
  const myPosts = [
    {
      id: 1,
      title: "마을공동도서관 건립 요청",
      category: "교육",
      preview: "어린이와 청년을 위한 도서관을...",
      agreeCount: 100,
      commentCount: 50
    },
    {
      id: 2,
      title: "마을공동도서관 건립",
      category: "교육",
      preview: "어린이와 청소년을 위한 도...",
      agreeCount: 100,
      commentCount: 50
    }
  ]

  // Mock participated proposals - TODO: Fetch from backend
  const participatedProposals = [
    {
      id: 3,
      title: "마을공동도서관 건립 요청",
      category: "교육"
    },
    {
      id: 4,
      title: "마을공동도서관 건립",
      category: "교육"
    }
  ]

  const handleLogout = () => {
    localStorage.removeItem("user")
    console.log("[v0] User logged out")
    router.push("/welcome")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background px-4 py-4">
        <h1 className="text-2xl font-bold">마이페이지</h1>
      </div>

      <div className="flex-1 space-y-6 px-4">
        {/* Profile Section */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-[#d3c1ff]" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-lg font-bold">{user.nickname}</h2>
                <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                  {user.region}
                </span>
              </div>
              <div className="mb-4">
                <p className="mb-2 text-sm font-semibold text-foreground">관심 분야</p>
                <div className="flex gap-2">
                  {user.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-muted px-3 py-1 text-sm text-foreground"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => router.push("/mypage/edit")}
                className="w-full rounded-lg bg-muted py-2 text-sm font-medium transition-colors hover:bg-muted/80"
              >
                프로필 편집
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">활동 현황</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-purple-600">{user.proposalCount}</div>
              <div className="text-sm text-muted-foreground">정책 제안</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-purple-600">{user.commentCount}</div>
              <div className="text-sm text-muted-foreground">댓글 작성</div>
            </div>
            <div className="text-center">
              <div className="mb-1 text-2xl font-bold text-purple-600">{user.likeCount}</div>
              <div className="text-sm text-muted-foreground">받은 좋아요</div>
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div>
          <h3 className="mb-3 text-lg font-bold">내가 작성한 글</h3>
          <div className="grid grid-cols-2 gap-3">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-muted/20"
                onClick={() => router.push(`/proposals/${post.id}`)}
              >
                <span className="mb-2 inline-block rounded-full bg-[#d3c1ff] px-3 py-1 text-xs font-medium text-foreground">
                  {post.category}
                </span>
                <h4 className="mb-2 text-sm font-bold">{post.title}</h4>
                <p className="mb-3 text-xs text-muted-foreground">{post.preview}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.agreeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post.commentCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Participated Proposals */}
        <div>
          <h3 className="mb-3 text-lg font-bold">내가 참여한 제안</h3>
          <div className="grid grid-cols-2 gap-3">
            {participatedProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="cursor-pointer rounded-xl bg-white p-4 shadow-sm transition-colors hover:bg-muted/20"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <span className="mb-2 inline-block rounded-full bg-[#d3c1ff] px-3 py-1 text-xs font-medium text-foreground">
                  {proposal.category}
                </span>
                <h4 className="text-sm font-bold">{proposal.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold">설정</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">알림 설정</div>
                  <div className="text-sm text-muted-foreground">새 댓글과 좋아요 알림</div>
                </div>
              </div>
              <button
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  notificationEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
                onClick={() => setNotificationEnabled(!notificationEnabled)}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    notificationEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button className="flex w-full items-center gap-3 transition-colors hover:bg-muted/50 rounded-lg p-2 -m-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">개인정보 보호</div>
                <div className="text-sm text-muted-foreground">내 정보 공개 범위 설정</div>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 transition-colors hover:bg-muted/50 rounded-lg p-2 -m-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-medium">도움말</div>
                <div className="text-sm text-muted-foreground">사용 방법 및 자주 묻는 질문</div>
              </div>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-red-600 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">로그아웃</span>
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
