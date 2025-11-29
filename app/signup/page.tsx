"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OKCHEON_REGIONS, GENDER_OPTIONS, JOB_CATEGORIES } from "@/lib/constants"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { apiFetch, fetchRegionId } from "@/lib/api"

interface OnboardingData {
  nickname: string
  age: number
  gender: string
  job: string
  region: string
  interests: string[]
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    nickname: "",
    age: 0,
    gender: "",
    job: "",
    region: "",
    interests: [],
  })

  const interestCategories = ["교육", "교통", "주거", "농업", "청년", "경제", "문화", "보건/복지"]

  const handleNext = () => {
    if (step === 1 && !formData.nickname) {
      alert("이름을 입력해주세요.")
      return
    }
    if (step === 2 && !formData.age) {
      alert("나이를 입력해주세요.")
      return
    }
    if (step === 3 && !formData.gender) {
      alert("성별을 선택해주세요.")
      return
    }
    if (step === 4 && !formData.job) {
      alert("직업을 선택해주세요.")
      return
    }
    if (step === 5 && !formData.region) {
      alert("거주 지역을 선택해주세요.")
      return
    }
    if (step === 6 && formData.interests.length === 0) {
      alert("관심 분야를 최소 1개 이상 선택해주세요.")
      return
    }

    if (step < 6) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.back()
    }
  }

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      let token: string | null = null

      const rid = await fetchRegionId(formData.region)

      try {
        const data = await apiFetch<{ token: string }>("/users", {
          method: "POST",
          body: {
            nickname: formData.nickname,
            age: formData.age,
            gender: formData.gender,
            job: formData.job,
            rid: rid || 1,
          },
        })
        token = data.token
        console.log("[v0] External API success, token received")
      } catch (e) {
        console.log("[v0] External API not available, using local mock API")
      }

      if (!token) {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: formData.nickname,
            age: formData.age,
            gender: formData.gender,
            job: formData.job,
            region: formData.region,
            interests: formData.interests,
          }),
        })

        if (!response.ok) {
          throw new Error("사용자 생성 실패")
        }

        const data = await response.json()
        token = data.userid || `mock_${Date.now()}`
      }

      if (token) {
        localStorage.setItem("access_token", token)
      }

      const user = {
        nickname: formData.nickname,
        age: formData.age,
        gender: formData.gender,
        job: formData.job,
        region: formData.region,
        interests: formData.interests,
      }
      localStorage.setItem("user", JSON.stringify(user))

      console.log("[v0] Onboarding completed, access_token saved")
      router.push("/policies")
    } catch (error) {
      console.error("[v0] Onboarding error:", error)
      alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Image src="/images/logo.png" alt="옥천 한입" width={120} height={48} />
        <div className="flex-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-balance text-2xl font-bold mb-2">환영합니다!</h1>
                <p className="text-muted-foreground">이름을 알려주세요.</p>
              </div>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="이름 입력"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="h-14 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 2: Age */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">나이를 알려주세요.</h1>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="나이 입력"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: Number.parseInt(e.target.value) || 0 })}
                  className="h-14 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Gender */}
          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">성별을 선택해주세요.</h1>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                className="space-y-3"
              >
                {GENDER_OPTIONS.map((gender) => (
                  <div key={gender} className="flex items-center space-x-3 rounded-lg border bg-white p-4">
                    <RadioGroupItem value={gender} id={gender} />
                    <Label htmlFor={gender} className="flex-1 cursor-pointer text-base">
                      {gender}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 4: Job */}
          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">직업을 선택해주세요.</h1>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="직업을 선택해주세요"
                  value={formData.job}
                  readOnly
                  className="h-14 bg-white"
                />
                <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border bg-white p-2">
                  {JOB_CATEGORIES.map((job) => (
                    <button
                      key={job}
                      type="button"
                      onClick={() => setFormData({ ...formData, job })}
                      className={`w-full rounded-md p-4 text-left transition-colors ${
                        formData.job === job ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted"
                      }`}
                    >
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Region */}
          {step === 5 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">거주 중인 지역은 어디인가요?</h1>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="읍면을 선택해주세요"
                  value={formData.region}
                  readOnly
                  className="h-14 bg-white"
                />
                <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-lg border bg-white p-2">
                  {OKCHEON_REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setFormData({ ...formData, region })}
                      className={`w-full rounded-md p-4 text-left transition-colors ${
                        formData.region === region ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Interests */}
          {step === 6 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">관심 분야를 선택해주세요.</h1>
              <p className="text-sm text-muted-foreground">
                관심 있는 정책 분야를 선택하면 맞춤형 정책 정보를 받아볼 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-3">
                {interestCategories.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`rounded-full px-6 py-3 text-sm font-medium transition-colors ${
                      formData.interests.includes(interest)
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Button */}
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="h-14 w-full bg-primary text-lg font-semibold hover:bg-primary/90"
        >
          {isLoading ? "처리 중..." : step === 6 ? "시작하기" : "다음"}
        </Button>
      </div>
    </div>
  )
}
