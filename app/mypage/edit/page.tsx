"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { requireAuth, getStoredUser } from "@/lib/auth"

export default function EditProfilePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    nickname: "옥천옥천",
    region: "옥천읍",
    interests: ["청년", "주거"],
  })

  useEffect(() => {
    if (!requireAuth(router)) return

    const storedUser = getStoredUser()
    if (storedUser) {
      setFormData({
        nickname: (storedUser.nickname as string) || "옥천옥천",
        region: (storedUser.region as string) || "옥천읍",
        interests: (storedUser.interests as string[]) || ["청년", "주거"],
      })
    }
  }, [router])

  const regions = ["옥천읍", "동이면", "안남면", "안내면", "청성면", "청산면", "이원면"]
  const interestOptions = ["교육", "교통", "주거", "농업", "청년", "경제", "문화", "보건/복지"]

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSave = () => {
    const storedUser = getStoredUser()
    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        ...formData,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
    console.log("[v0] Profile updated:", formData)
    router.back()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background px-4 py-4">
        <button onClick={() => router.back()}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">프로필 편집</h1>
      </div>

      <div className="flex-1 space-y-6 px-4 pb-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="h-24 w-24 rounded-full bg-[#d3c1ff]" />
          <button className="text-sm text-primary">프로필 사진 변경</button>
        </div>

        {/* Nickname */}
        <div>
          <label className="mb-2 block text-sm font-semibold">닉네임</label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => setFormData((prev) => ({ ...prev, nickname: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        {/* Region */}
        <div>
          <label className="mb-2 block text-sm font-semibold">거주 지역</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm"
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Interests */}
        <div>
          <label className="mb-2 block text-sm font-semibold">관심 분야</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  formData.interests.includes(interest)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          저장하기
        </button>
      </div>
    </div>
  )
}
