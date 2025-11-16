"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Check, ChevronDown } from 'lucide-react'
import { OKCHEON_REGIONS, POLICY_CATEGORIES } from "@/lib/constants"

type Step = 1 | 2 | 3 | 4

// Mock AI recommended examples
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
  
  // Step 1: Basic Info
  const [selectedRegion, setSelectedRegion] = useState("옥천읍")
  const [title, setTitle] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  // Step 2: Problem Definition
  const [problem, setProblem] = useState("")
  
  // Step 3: Solution & AI Examples
  const [selectedExamples, setSelectedExamples] = useState<number[]>([])
  const [solution, setSolution] = useState("")
  const [expectedEffect, setExpectedEffect] = useState("")
  
  // Step 4: Final Summary (auto-populated from previous steps)

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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step)
    }
  }

  const handleSubmit = () => {
    // TODO: Call API to submit proposal
    console.log("[v0] Submitting proposal:", {
      region: selectedRegion,
      title,
      categories: selectedCategories,
      problem,
      solution,
      expectedEffect,
      relatedExamples: selectedExamples
    })
    router.push("/proposals")
  }

  const progressPercentage = (currentStep / 4) * 100

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && POLICY_CATEGORIES.includes(categoryFromUrl as any)) {
      setSelectedCategories([categoryFromUrl])
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => currentStep === 1 ? router.back() : setCurrentStep((currentStep - 1) as Step)}
            className="text-foreground"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">정책 제안</h1>
          <div className="w-6" />
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-[#d3c1ff] transition-all duration-300"
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3c1ff] text-sm font-semibold">
                1
              </div>
              <h2 className="text-xl font-bold">기본 정보</h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              단계별로 차근차근 정책을 제안해봅니다.
              <br />
              무선 간단한 정보부터 입력해볼까요?
            </p>

            {/* Region Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">어느 지역에 제안하시나요?</label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
                >
                  {OKCHEON_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">정책 제안 제목을 입력해주세요.</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 옥천읍에 공용 자전거를 설치해주세요"
                className="w-full rounded-lg border border-input bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                정책 분야를 선택해주세요. (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {POLICY_CATEGORIES.filter(c => c !== "전체").map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategories.includes(category)
                        ? "bg-[#d3c1ff] text-foreground"
                        : "bg-muted text-muted-foreground"
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3c1ff] text-sm font-semibold">
                2
              </div>
              <h2 className="text-xl font-bold">문제 정의하기</h2>
            </div>

            <p className="text-sm font-medium">어떤 문제를 해결하고 싶으신가요?</p>

            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="예: 옥천읍에서 다른 읍으로 다니기가 힘들어요"
              className="min-h-[200px] w-full resize-none rounded-lg border border-input bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
            />

            <p className="text-xs text-muted-foreground">
              💡 누가, 언제, 어떤 불편함 겪는지 구체적으로 적어보세요
            </p>
          </div>
        )}

        {/* Step 3: Solution & AI Examples */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3c1ff] text-sm font-semibold">
                3
              </div>
              <h2 className="text-xl font-bold">문제 해결 방안 제시</h2>
            </div>

            {/* AI Recommended Examples */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">AI의 추천 사례</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                비슷한 문제를 해결한 사례를 찾았어요.
                <br />
                아래 사례를 참고해서 우리 지역에 맞는 해결책을 만들어보세요.
              </p>

              <div className="space-y-3">
                {mockAIExamples.map((example) => (
                  <button
                    key={example.id}
                    onClick={() => toggleExample(example.id)}
                    className="relative w-full rounded-xl border border-border bg-muted/50 p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="mb-2">
                      <p className="text-sm font-medium leading-snug">{example.title}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-background px-3 py-1 text-xs">{example.region}</span>
                      <span className="rounded-full bg-[#d3c1ff] px-3 py-1 text-xs font-medium">{example.category}</span>
                    </div>
                    {selectedExamples.includes(example.id) && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#d3c1ff]">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Writing Guide */}
            <div className="space-y-3 rounded-xl bg-[#d3c1ff] p-4">
              <h3 className="text-sm font-semibold">AI 제안서 작성 가이드</h3>
              <ul className="space-y-1 text-xs leading-relaxed">
                <li>• 구체적인 실천 장소를 제안해보세요</li>
                <li>• 비슷한 사례의 예산 구모를 참고해보세요</li>
                <li>• 어떤 사람들이 가장 많이 이용할 것 같나요?</li>
              </ul>
            </div>

            {/* Solution Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">문제를 어떻게 해결할 수 있을까요?</label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="예:&#10;• 옥천읍의 학교 및 아파트 근처에 자전거 반납소 설치&#10;• 대전시 타슈처럼 옥천읍의 공용 자전거 열람 만들어서 관리"
                className="min-h-[150px] w-full resize-none rounded-lg border border-input bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
              />
            </div>

            {/* Expected Effect Input */}
            <div className="space-y-3">
              <label className="text-sm font-medium">기대되는 효과는 무엇인가요?</label>
              <textarea
                value={expectedEffect}
                onChange={(e) => setExpectedEffect(e.target.value)}
                placeholder="예:&#10;• 아이들이 도로 교통 교육 가능&#10;• 버스 외의 대중교통으로 이동성 보장"
                className="min-h-[150px] w-full resize-none rounded-lg border border-input bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#d3c1ff]"
              />
            </div>
          </div>
        )}

        {/* Step 4: Final Summary */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d3c1ff] text-sm font-semibold">
                4
              </div>
              <h2 className="text-xl font-bold">글로 정리하기</h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              지금까지 쓴 글을 하나로 정리해보세요.
              <br />
              필요하다면 AI에게 글 교정을 받을 수 있어요.
            </p>

            {/* Tags and Title */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <span className="rounded-full bg-background px-3 py-1.5 text-sm font-medium">
                  {selectedRegion}
                </span>
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-[#d3c1ff] px-3 py-1.5 text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-bold leading-snug">{title || "제목 없음"}</h3>
            </div>

            {/* Summary Sections */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-bold">1. 문제 정의</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {problem || "문제가 입력되지 않았습니다."}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-3 text-sm font-bold">2. 관련 정책 사례</h4>
                {selectedExamples.length > 0 ? (
                  <div className="space-y-3">
                    {mockAIExamples
                      .filter(ex => selectedExamples.includes(ex.id))
                      .map((example) => (
                        <div key={example.id} className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-sm font-medium">{example.title}</p>
                          <div className="flex gap-2">
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{example.region}</span>
                            <span className="rounded-full bg-[#d3c1ff] px-2.5 py-0.5 text-xs font-medium">
                              {example.category}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">선택된 사례가 없습니다.</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-bold">3. 해결 방안 제시</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {solution || "해결 방안이 입력되지 않았습니다."}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-bold">4. 기대 효과</h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {expectedEffect || "기대 효과가 입력되지 않았습니다."}
                </p>
              </div>
            </div>

            {/* AI Correction Button (Floating) */}
            <button className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#d3c1ff] shadow-lg transition-transform hover:scale-105 active:scale-95">
              <div className="flex flex-col items-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span className="text-[10px] font-medium">AI 교정</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0 border-t border-border bg-background p-4">
        <button
          onClick={currentStep === 4 ? handleSubmit : handleNext}
          className="w-full rounded-xl bg-[#d3c1ff] py-3.5 text-center font-semibold transition-colors hover:bg-[#c5b3f0] active:bg-[#b7a5e2]"
        >
          {currentStep === 4 ? "게시하기" : "다음 단계"}
        </button>
      </div>
    </div>
  )
}
