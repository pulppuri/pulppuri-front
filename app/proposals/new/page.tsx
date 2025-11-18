"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Check, ChevronDown } from 'lucide-react'
import { POLICY_CATEGORIES, OKCHEON_REGIONS } from "@/lib/constants"
import { apiRequest, API_ENDPOINTS } from "@/lib/api"

type Step = 1 | 2 | 3 | 4

const mockAIExamples = [
  {
    id: 1,
    title: "대전시 공용 자전거 '타슈' 공영적 반응 세도",
    region: "대전",
    category: "교통"
  },
  {
    id: 2,
    title: "대전시 공용 자전거 '타슈' 공영적 반응 세도",
    region: "대전",
    category: "교통"
  }
]

export default function NewProposalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Step 1: Basic Info
  const [selectedRegion, setSelectedRegion] = useState("")
  const [title, setTitle] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Step 2: Problem Definition
  const [problem, setProblem] = useState("")
  
  // Step 3: Solution & AI Examples
  const [selectedExamples, setSelectedExamples] = useState<number[]>([])
  const [solution, setSolution] = useState("")
  const [expectedEffect, setExpectedEffect] = useState("")

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(prev => prev.filter(c => c !== category))
    } else {
      setSelectedCategories(prev => [...prev, category])
    }
  }

  const toggleExample = (exampleId: number) => {
    if (selectedExamples.includes(exampleId)) {
      setSelectedExamples(prev => prev.filter(id => id !== exampleId))
    } else {
      setSelectedExamples(prev => [...prev, exampleId])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== "" && selectedCategories.length > 0 && selectedRegion !== ""
      case 2:
        return problem.trim() !== ""
      case 3:
        return solution.trim() !== "" && expectedEffect.trim() !== ""
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const userStr = localStorage.getItem("user")
      
      if (!userStr) {
        alert("로그인이 필요합니다.")
        router.push("/signup")
        return
      }

      const user = JSON.parse(userStr)
      
      if (!user.userid && !user.id) {
        alert("로그인이 필요합니다.")
        router.push("/signup")
        return
      }

      const proposalData = {
        id: Date.now(), // Generate unique ID using timestamp
        eid: 1,
        rid: 1,
        uid: user.userid || user.id,
        title: title.trim(),
        content: `문제 정의:\n${problem.trim()}\n\n해결 방안:\n${solution.trim()}\n\n기대 효과:\n${expectedEffect.trim()}`,
        region: selectedRegion,
        tags: selectedCategories.map((cat, idx) => ({ id: idx + 1, name: cat })),
        relatedExampleIds: selectedExamples,
        read_cnt: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
      }

      console.log("[v0] Submitting proposal:", proposalData)

      const existingProposalsStr = localStorage.getItem("proposals")
      const existingProposals = existingProposalsStr ? JSON.parse(existingProposalsStr) : []
      
      const updatedProposals = [proposalData, ...existingProposals]
      localStorage.setItem("proposals", JSON.stringify(updatedProposals))
      
      console.log("[v0] Proposal saved to localStorage")
      
      // Small delay to ensure localStorage write completes
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push("/proposals")
    } catch (error) {
      console.error("[v0] Error submitting proposal:", error)
      alert("오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / 4) * 100

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    
    console.log("[v0] Category from URL:", categoryFromUrl)
    console.log("[v0] Available categories:", POLICY_CATEGORIES)
    
    if (categoryFromUrl) {
      const validCategories = POLICY_CATEGORIES.filter(c => c !== "전체")
      console.log("[v0] Valid categories:", validCategories)
      
      if (validCategories.includes(categoryFromUrl)) {
        console.log("[v0] Setting selected category:", categoryFromUrl)
        setSelectedCategories([categoryFromUrl])
      } else {
        console.log("[v0] Category not found in valid categories:", categoryFromUrl)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - run only once on mount

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => currentStep === 1 ? router.back() : setCurrentStep((currentStep - 1) as Step)}
            className="text-gray-900"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">정책 제안</h1>
          <div className="w-6" />
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#b4a0e5] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b4a0e5] text-base font-bold text-white">
                1
              </div>
              <h2 className="text-xl font-bold text-gray-900">기본 정보</h2>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              단계별로 차근차근 정책을 제안해봅니다.
              <br />
              우선 간단한 정보부터 입력해볼까요?
            </p>

            {/* Region Selection */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                어느 지역에 제안하시나요?
              </label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-base text-gray-900 focus:border-[#b4a0e5] focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
                >
                  <option value="" disabled>옥천읍</option>
                  {OKCHEON_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                정책 제안 제목을 입력해주세요.
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 옥천읍에 공용 자전거를 설치해주세요"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                정책 분야를 선택해주세요. (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {POLICY_CATEGORIES.filter(c => c !== "전체").map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? "bg-[#b4a0e5] text-gray-900"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Problem Definition */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b4a0e5] text-base font-bold text-white">
                2
              </div>
              <h2 className="text-xl font-bold text-gray-900">문제 정의하기</h2>
            </div>

            <p className="text-base font-semibold text-gray-900">
              어떤 문제를 해결하고 싶으신가요?
            </p>

            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="예: 옥천읍에서 다른 읍으로 다니기가 힘들어요"
              className="min-h-[280px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
            />

            <p className="flex items-start gap-1 text-sm text-gray-500">
              <span>💡</span>
              <span>누가, 언제, 어떤 불편을 겪는지 구체적으로 적어보세요</span>
            </p>
          </div>
        )}

        {/* Step 3: Solution & AI Examples */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b4a0e5] text-base font-bold text-white">
                3
              </div>
              <h2 className="text-xl font-bold text-gray-900">문제 해결 방안 제시</h2>
            </div>

            {/* AI Recommended Examples */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900">AI의 추천 사례</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                비슷한 문제를 해결한 사례를 찾았어요.
                <br />
                아래 사례를 참고해서 우리 지역에 맞는 해결책을 만들어보세요.
              </p>

              <div className="space-y-3">
                {mockAIExamples.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => toggleExample(example.id)}
                    className="relative w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-[#b4a0e5] hover:bg-white"
                  >
                    <div className="mb-3 pr-8">
                      <p className="text-sm font-medium leading-snug text-gray-900">
                        {example.title}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
                        {example.region}
                      </span>
                      <span className="rounded-full bg-[#b4a0e5] px-3 py-1 text-xs font-medium text-gray-900">
                        {example.category}
                      </span>
                    </div>
                    {selectedExamples.includes(example.id) && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#b4a0e5]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Writing Guide */}
            <div className="space-y-3 rounded-xl bg-[#b4a0e5] p-5">
              <h3 className="text-base font-bold text-gray-900">AI 제안서 작성 가이드</h3>
              <ul className="space-y-1.5 text-sm leading-relaxed text-gray-900">
                <li>• 구체적인 실천 장소를 제안해보세요</li>
                <li>• 비슷한 사례의 예산 규모를 참인해보세요</li>
                <li>• 어떤 사람들이 가장 많이 이용할 것 같나요?</li>
              </ul>
            </div>

            {/* Solution Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                문제를 어떻게 해결할 수 있을까요?
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="예:&#10;• 옥천읍의 학교 및 아파트 근처에 자전거 반납소 설치&#10;• 대전시 타슈처럼 옥천읍의 공용 자전거 앱을 만들어서 관리"
                className="min-h-[180px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
              />
            </div>

            {/* Expected Effect Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">
                기대되는 효과는 무엇인가요?
              </label>
              <textarea
                value={expectedEffect}
                onChange={(e) => setExpectedEffect(e.target.value)}
                placeholder="예:&#10;• 아이들의 도로 교통 교육 가능&#10;• 버스 외의 대중교통으로 이동성 보장"
                className="min-h-[180px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: Final Summary */}
        {currentStep === 4 && (
          <div className="space-y-6 pb-24">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b4a0e5] text-base font-bold text-white">
                4
              </div>
              <h2 className="text-xl font-bold text-gray-900">글로 정리하기</h2>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              지금까지 쓴 글을 하나로 정리해보세요.
              <br />
              필요하다면 AI에게 글 교정을 받을 수 있어요.
            </p>

            {/* Tags and Title */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-900">
                  {selectedRegion}
                </span>
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-[#b4a0e5] px-4 py-1.5 text-sm font-medium text-gray-900"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-bold leading-snug text-gray-900">
                {title || "옥천읍에 공용 자전거를 설치해주세요."}
              </h3>
            </div>

            {/* Summary Sections - wrapped in gray background */}
            <div className="space-y-6 rounded-2xl bg-gray-50 p-5">
              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">1. 문제 정의</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {problem || "옥천읍에서 다른 읍으로 다니기가 힘들어요"}
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">2. 관련 정책 사례</h4>
                {selectedExamples.length > 0 ? (
                  <div className="space-y-3">
                    {mockAIExamples
                      .filter(ex => selectedExamples.includes(ex.id))
                      .map((example) => (
                        <div key={example.id} className="rounded-xl bg-white p-4 shadow-sm">
                          <p className="mb-3 text-sm font-medium leading-snug text-gray-900">
                            {example.title}
                          </p>
                          <div className="flex gap-2">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900">
                              {example.region}
                            </span>
                            <span className="rounded-full bg-[#b4a0e5] px-3 py-1 text-xs font-medium text-gray-900">
                              {example.category}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="mb-3 text-sm font-medium text-gray-900">
                      대전시 공용 자전거 '타슈' 공영적 반응 세도
                    </p>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900">
                        대전
                      </span>
                      <span className="rounded-full bg-[#b4a0e5] px-3 py-1 text-xs font-medium text-gray-900">
                        교통
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">3. 해결 방안 제시</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {solution || "대전시 타슈 사례를 보면 OO 예산으로 OO명이 이용 중이라고 합니다. 우수사례에서 보았듯이 옥천읍에도 공용 자전거를 확보 근처에 설치해주세요"}
                </p>
              </div>

              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">4. 기대 효과</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  {expectedEffect || "월신 빠르게 이동할 수 있어서 삶의 질이 높아져요"}
                </p>
              </div>
            </div>

            {/* AI Correction Button (Floating) */}
            <button className="fixed bottom-28 right-6 z-20 flex flex-col items-center justify-center gap-1 rounded-full bg-[#b4a0e5] px-4 py-3 shadow-lg transition-transform hover:scale-105 active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-900">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-xs font-bold text-gray-900">AI 교정</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white p-4">
        <button
          onClick={currentStep === 4 ? handleSubmit : handleNext}
          disabled={!canProceed() || (currentStep === 4 && isSubmitting)}
          className={`w-full rounded-xl py-4 text-center text-base font-bold transition-all ${
            canProceed() && !isSubmitting
              ? "bg-[#b4a0e5] text-gray-900 hover:bg-[#a693d9] active:scale-98"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currentStep === 4 
            ? (isSubmitting ? "게시 중..." : "게시하기")
            : "다음 단계"
          }
        </button>
      </div>
    </div>
  )
}
