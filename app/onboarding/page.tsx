"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OKCHEON_REGIONS, GENDER_OPTIONS, JOB_CATEGORIES } from "@/lib/constants"
import type { OnboardingData } from "@/types"
import { ArrowLeft } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({
    nickname: "",
    age: 0,
    gender: "",
    job: "",
    region: "",
  })

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

    if (step < 5) {
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

  const handleSubmit = async () => {
    // TODO: Backend API 연동
    // const response = await fetch(`${API_CONFIG.BASE_URL}/users`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData),
    // })

    console.log("[v0] Onboarding completed:", formData)

    // Store user data in localStorage for now
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: Math.floor(Math.random() * 10000),
        ...formData,
        rid: 1, // Mock region id
      }),
    )

    // Navigate to main policy page
    router.push("/policies")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
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
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">이름을 알려주세요.</h1>
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

          {step === 4 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">직업을 선택해주세요.</h1>
              <Select value={formData.job} onValueChange={(value) => setFormData({ ...formData, job: value })}>
                <SelectTrigger className="h-14 bg-white">
                  <SelectValue placeholder="직업을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_CATEGORIES.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
        </div>

        {/* Bottom Button */}
        <Button onClick={handleNext} className="h-14 w-full bg-primary text-lg font-semibold hover:bg-primary/90">
          {step === 5 ? "확인" : "다음"}
        </Button>
      </div>
    </div>
  )
}
