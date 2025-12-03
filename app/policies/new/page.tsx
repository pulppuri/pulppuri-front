"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LinkIcon, Loader2 } from "lucide-react"
import type { PolicyCategory } from "@/types"
import { requireAuth } from "@/lib/auth"
import { fetchRegionId, createExample, autofillFromUrl } from "@/lib/api"

const POLICY_FIELDS: PolicyCategory[] = ["교육", "교통", "주거", "농업", "청년", "경제", "문화", "보건/복지"]

export default function NewPolicyPage() {
  const router = useRouter()
  const [linkUrl, setLinkUrl] = useState("")
  const [title, setTitle] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [region, setRegion] = useState("")
  const [summary, setSummary] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutofilling, setIsAutofilling] = useState(false)

  useEffect(() => {
    requireAuth(router)
  }, [router])

  const toggleField = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
  }

  const handleAutofill = async () => {
    if (!linkUrl.trim()) {
      alert("링크를 입력해주세요.")
      return
    }

    // URL 유효성 검사
    try {
      new URL(linkUrl.trim())
    } catch {
      alert("유효한 URL을 입력해주세요.")
      return
    }

    setIsAutofilling(true)

    try {
      const result = await autofillFromUrl(linkUrl.trim())

      if (result?.summary) {
        setSummary(result.summary)
        // 제목이 비어있고 응답에 title이 있으면 자동 채움
        if (!title.trim() && result.title) {
          setTitle(result.title)
        }
        alert("요약이 자동으로 생성되었습니다.")
      } else {
        alert("요약을 생성하지 못했습니다. 직접 입력해주세요.")
      }
    } catch (error) {
      console.error("[v0] Autofill error:", error)
      alert("요약 생성에 실패했습니다. 직접 입력해주세요.")
    } finally {
      setIsAutofilling(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      alert("제목을 입력해주세요.")
      return
    }
    if (selectedFields.length === 0) {
      alert("정책 분야를 최소 1개 이상 선택해주세요.")
      return
    }
    if (!region.trim()) {
      alert("정책 지역을 입력해주세요.")
      return
    }
    if (!summary.trim()) {
      alert("정책 사례 요약을 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. region 이름으로 rid 조회
      const rid = await fetchRegionId(region.trim())

      if (!rid) {
        alert("지역을 찾을 수 없습니다. 다른 지역명을 입력해주세요.")
        setIsSubmitting(false)
        return
      }

      // 2. POST /examples 호출
      const exDto = {
        rid,
        title: title.trim(),
        thumbnail: null, // UI에서 썸네일 입력 없음
        content: summary.trim(),
        reference: linkUrl.trim() || "", // 링크가 없으면 빈 문자열
        tags: selectedFields,
      }

      console.log("[v0] Creating example with dto:", exDto)

      const response = await createExample(exDto)

      console.log("[v0] Create example response:", response)

      // 3. 성공 시 알림 및 리스트로 이동
      alert("정책 사례가 성공적으로 공유되었습니다!")

      // router.refresh()로 리스트 갱신 후 이동
      router.push("/policies")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating example:", error)

      // 에러 메시지 분기
      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("403")) {
          alert("인증이 필요합니다. 다시 로그인해주세요.")
          router.push("/signup")
          return
        }
        alert(`정책 사례 공유에 실패했습니다: ${error.message}`)
      } else {
        alert("정책 사례 공유에 실패했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center">
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-[16px] font-semibold text-gray-900">정책 사례 공유</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 space-y-6 p-5">
        {/* Section Title */}
        <h2 className="text-[18px] font-bold text-gray-900">정책 사례 공유하기</h2>

        <div className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3">
          <LinkIcon className="h-4 w-4 text-gray-500" />
          <input
            type="url"
            placeholder="링크 첨부하기"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAutofill()
              }
            }}
            className="flex-1 border-0 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={handleAutofill}
            disabled={isAutofilling || !linkUrl.trim()}
            className="shrink-0 rounded-md bg-[#b69df8] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#a88de8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isAutofilling ? <Loader2 className="h-4 w-4 animate-spin" /> : "자동채우기"}
          </button>
        </div>

        <div className="border-t border-gray-200" />

        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#b69df8] focus:outline-none focus:ring-1 focus:ring-[#b69df8]"
          />
        </div>

        {/* Policy Field */}
        <div className="space-y-3">
          <label className="text-[14px] font-medium text-gray-900">정책 분야(복수 선택 가능)</label>
          <div className="flex flex-wrap gap-2">
            {POLICY_FIELDS.map((field) => (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className={`rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  selectedFields.includes(field)
                    ? "bg-[#b69df8] text-white"
                    : "bg-[#f5f5f5] text-gray-700 hover:bg-gray-200"
                }`}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        {/* Region - Changed from select dropdown to text input */}
        <div className="space-y-3">
          <label className="text-[14px] font-medium text-gray-900">정책 지역</label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="지역을 입력하세요"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#b69df8] focus:outline-none focus:ring-1 focus:ring-[#b69df8]"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[14px] font-medium text-gray-900">정책 사례 요약</label>
          <div className="relative">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={isAutofilling ? "요약 생성 중..." : "정책 사례에 대한 설명을 작성해주세요..."}
              disabled={isAutofilling}
              rows={8}
              className="w-full rounded-lg border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#b69df8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b69df8] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isAutofilling && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                <div className="flex items-center gap-2 text-[#b69df8]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">요약 생성 중...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="border-t border-gray-100 p-5">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isAutofilling}
          className="h-12 w-full rounded-lg bg-[#b69df8] text-[15px] font-semibold text-white hover:bg-[#a88de8] disabled:bg-gray-300"
        >
          {isSubmitting ? "공유 중..." : "사례 공유하기"}
        </Button>
      </div>
    </div>
  )
}
