"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, LinkIcon } from "lucide-react"
import type { PolicyCategory } from "@/types"
import { requireAuth } from "@/lib/auth"

const POLICY_FIELDS: PolicyCategory[] = ["교육", "교통", "주거", "농업", "청년", "경제", "문화", "보건/복지"]

export default function NewPolicyPage() {
  const router = useRouter()
  const [linkUrl, setLinkUrl] = useState("")
  const [title, setTitle] = useState("")
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [region, setRegion] = useState("")
  const [summary, setSummary] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    requireAuth(router)
  }, [router])

  const toggleField = (field: string) => {
    setSelectedFields((prev) => (prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]))
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
      // TODO: API call to backend
      const newExample = {
        title: title.trim(),
        content: summary.trim(),
        reference: region.trim(),
        link: linkUrl.trim() || undefined,
        tags: selectedFields,
        created_at: Date.now(),
      }

      console.log("[v0] Creating new policy example:", newExample)

      // For now, save to localStorage
      const existingExamples = JSON.parse(localStorage.getItem("customExamples") || "[]")
      const newId = Date.now()
      const savedExample = {
        id: newId,
        uid: 1, // TODO: Get from logged in user
        rid: 1, // TODO: Map region to region id
        ...newExample,
        updated_at: newExample.created_at,
        likes: 0,
        comments: 0,
        read_cnt: 0,
        isLiked: false,
        isBookmarked: false,
      }

      existingExamples.push(savedExample)
      localStorage.setItem("customExamples", JSON.stringify(existingExamples))

      alert("정책 사례가 성공적으로 공유되었습니다!")
      router.push("/policies")
    } catch (error) {
      console.error("[v0] Error creating policy example:", error)
      alert("정책 사례 공유에 실패했습니다. 다시 시도해주세요.")
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

        {/* Link Attachment */}
        <div className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3">
          <LinkIcon className="h-4 w-4 text-gray-500" />
          <input
            type="url"
            placeholder="링크 첨부하기"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 border-0 bg-transparent text-[14px] text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
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

        {/* Summary */}
        <div className="space-y-3">
          <label className="text-[14px] font-medium text-gray-900">정책 사례 요약</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="정책 사례에 대한 설명을 작성해주세요..."
            rows={8}
            className="w-full rounded-lg border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:border-[#b69df8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#b69df8] resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="border-t border-gray-100 p-5">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-12 w-full rounded-lg bg-[#b69df8] text-[15px] font-semibold text-white hover:bg-[#a88de8] disabled:bg-gray-300"
        >
          {isSubmitting ? "공유 중..." : "사례 공유하기"}
        </Button>
      </div>
    </div>
  )
}
