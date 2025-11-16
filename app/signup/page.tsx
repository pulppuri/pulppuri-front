"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OKCHEON_REGIONS, GENDER_OPTIONS, JOB_CATEGORIES } from "@/lib/constants"
import { ArrowLeft } from 'lucide-react'
import Image from "next/image"
import type { SignupData } from "@/types"

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<SignupData>({
    userId: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    age: 0,
    gender: "",
    job: "",
    region: "",
  })

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.userId) {
        alert("아이디를 입력해주세요.")
        return
      }
      if (formData.userId.length < 4) {
        alert("아이디는 4자 이상이어야 합니다.")
        return
      }
    }
    if (step === 2) {
      if (!formData.password) {
        alert("비밀번호를 입력해주세요.")
        return
      }
      if (formData.password.length < 6) {
        alert("비밀번호는 6자 이상이어야 합니다.")
        return
      }
      if (formData.password !== formData.passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.")
        return
      }
    }
    if (step === 3 && !formData.nickname) {
      alert("이름을 입력해주세요.")
      return
    }
    if (step === 4 && !formData.age) {
      alert("나이를 입력해주세요.")
      return
    }
    if (step === 5 && !formData.gender) {
      alert("성별을 선택해주세요.")
      return
    }
    if (step === 6 && !formData.job) {
      alert("직업을 선택해주세요.")
      return
    }
    if (step === 7 && !formData.region) {
      alert("거주 지역을 선택해주세요.")
      return
    }

    if (step < 7) {
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
    //   body: JSON.stringify({
    //     userId: formData.userId,
    //     password: formData.password,
    //     nickname: formData.nickname,
    //     age: formData.age,
    //     gender: formData.gender,
    //     job: formData.job,
    //     region: formData.region
    //   }),
    // })
    // const data = await response.json()
    // if (response.ok) {
    //   localStorage.setItem('user', JSON.stringify(data.user))
    //   router.push('/policies')
    // }

    console.log("[v0] Signup completed:", formData)

    // Mock user creation and save to localStorage
    const newUser = {
      id: Math.floor(Math.random() * 10000),
      userId: formData.userId,
      nickname: formData.nickname,
      age: formData.age,
      gender: formData.gender,
      job: formData.job,
      region: formData.region,
      rid: 1,
    }

    localStorage.setItem("user", JSON.stringify(newUser))
    router.push("/policies")
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
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
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
          {/* Step 1: User ID */}
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">아이디를 입력해주세요.</h1>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="아이디 입력 (4자 이상)"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="h-14 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-balance text-2xl font-bold">비밀번호를 설정해주세요.</h1>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="비밀번호 입력 (6자 이상)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 bg-white"
                />
                <Input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  className="h-14 bg-white"
                />
              </div>
            </div>
          )}

          {/* Step 3: Name */}
          {step === 3 && (
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

          {/* Step 4: Age */}
          {step === 4 && (
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

          {/* Step 5: Gender */}
          {step === 5 && (
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

          {/* Step 6: Job (with scroll picker) */}
          {step === 6 && (
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

          {/* Step 7: Region */}
          {step === 7 && (
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
          {step === 7 ? "완료" : "다음"}
        </Button>
      </div>
    </div>
  )
}
