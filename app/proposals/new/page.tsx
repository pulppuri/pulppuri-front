"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Check, ChevronDown, Loader2, RefreshCw } from "lucide-react"
import { POLICY_CATEGORIES, OKCHEON_REGIONS } from "@/lib/constants"
import { fetchRegionId, createGuideline, createProposal, helperRevise, helperReviseField } from "@/lib/api"
import { requireAuth } from "@/lib/auth"
import type { PolicyCategory, GuidelinesResponse, ExampleSummary, CreateProposalDto, HelperDto } from "@/types"
import AiEditableField, { type FieldStatus } from "@/components/AiEditableField"

type Step = 1 | 2 | 3 | 4

interface FieldState {
  status: FieldStatus
  aiCorrectedText?: string
}

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

  const [guidelinesData, setGuidelinesData] = useState<GuidelinesResponse | null>(null)
  const [isGuidelinesLoading, setIsGuidelinesLoading] = useState(false)
  const [guidelinesError, setGuidelinesError] = useState<string | null>(null)
  const [resolvedRid, setResolvedRid] = useState<number | null>(null)
  const lastGuidelineKeyRef = useRef<string | null>(null)

  const [isAiCorrecting, setIsAiCorrecting] = useState(false)
  const [focusedField, setFocusedField] = useState<"problem" | "method" | "effect" | null>(null)
  const [fieldStates, setFieldStates] = useState<{
    problem: FieldState
    method: FieldState
    effect: FieldState
  }>({
    problem: { status: "idle" },
    method: { status: "idle" },
    effect: { status: "idle" },
  })

  useEffect(() => {
    requireAuth(router)
  }, [router])

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    } else {
      setSelectedCategories((prev) => [...prev, category])
    }
  }

  const toggleExample = (exampleId: number) => {
    if (selectedExamples.includes(exampleId)) {
      setSelectedExamples((prev) => prev.filter((id) => id !== exampleId))
    } else {
      setSelectedExamples((prev) => [...prev, exampleId])
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return title.trim() !== "" && selectedCategories.length > 0 && selectedRegion !== ""
      case 2:
        return problem.trim() !== ""
      case 3:
        return (
          !!guidelinesData &&
          !isGuidelinesLoading &&
          !guidelinesError &&
          solution.trim() !== "" &&
          expectedEffect.trim() !== ""
        )
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

  const fetchGuidelines = async (forceRetry = false) => {
    // 인증 체크
    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/signup")
      return
    }

    // 입력값 검증
    if (!selectedRegion) {
      setGuidelinesError("지역을 선택해 주세요.")
      return
    }
    if (!title.trim()) {
      setGuidelinesError("제목을 입력해 주세요.")
      return
    }
    if (selectedCategories.length === 0) {
      setGuidelinesError("정책 분야를 선택해 주세요.")
      return
    }
    if (!problem.trim()) {
      setGuidelinesError("문제를 입력해 주세요.")
      return
    }

    const guidelineKey = JSON.stringify({
      selectedRegion,
      title: title.trim(),
      selectedCategories,
      problem: problem.trim(),
    })

    if (!forceRetry && lastGuidelineKeyRef.current === guidelineKey && guidelinesData) {
      return
    }

    const isKeyChanged = lastGuidelineKeyRef.current !== guidelineKey
    if (isKeyChanged) {
      setGuidelinesData(null)
      setSelectedExamples([])
    }

    setIsGuidelinesLoading(true)
    setGuidelinesError(null)

    try {
      // 1. 지역 ID 조회
      const rid = await fetchRegionId(selectedRegion)
      if (rid === null) {
        setGuidelinesError("지역 정보를 찾을 수 없어요. 다른 지역을 선택해 주세요.")
        setIsGuidelinesLoading(false)
        return
      }
      setResolvedRid(rid)

      // 2. 가이드라인 생성 요청
      const response = await createGuideline({
        title: title.trim(),
        rid,
        categories: selectedCategories,
        problem: problem.trim(),
      })

      setGuidelinesData(response)
      lastGuidelineKeyRef.current = guidelineKey
    } catch (error) {
      console.error("[v0] Guidelines fetch error:", error)
      setGuidelinesError("가이드를 불러오지 못했습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.")
    } finally {
      setIsGuidelinesLoading(false)
    }
  }

  useEffect(() => {
    if (currentStep === 3) {
      fetchGuidelines()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const handleAiCorrectAll = useCallback(async () => {
    setIsAiCorrecting(true)
    setFieldStates({
      problem: { status: "loading" },
      method: { status: "loading" },
      effect: { status: "loading" },
    })

    try {
      // helperRevise API 호출
      const dto: HelperDto = {
        title: title.trim(),
        problem: problem,
        method: solution,
        effect: expectedEffect,
      }
      const result = await helperRevise(dto)

      setFieldStates({
        problem: { status: "suggested", aiCorrectedText: result.problem },
        method: { status: "suggested", aiCorrectedText: result.method },
        effect: { status: "suggested", aiCorrectedText: result.effect },
      })
    } catch (error) {
      console.error("[v0] AI correction error:", error)
      alert("서버 오류로 AI 교정에 실패했어요. 다시 시도해주세요.")
      // 에러 시 idle로 복귀
      setFieldStates({
        problem: { status: "idle" },
        method: { status: "idle" },
        effect: { status: "idle" },
      })
    } finally {
      setIsAiCorrecting(false)
    }
  }, [title, problem, solution, expectedEffect])

  const handleReCorrectField = useCallback(
    async (fieldName: "problem" | "method" | "effect") => {
      setIsAiCorrecting(true)
      setFieldStates((prev) => ({
        ...prev,
        [fieldName]: { status: "loading" },
      }))

      try {
        // helperReviseField는 전체 텍스트를 보내고 해당 필드만 추출
        const currentTexts: HelperDto = {
          title: title.trim(),
          problem: problem,
          method: solution,
          effect: expectedEffect,
        }
        const result = await helperReviseField(fieldName, currentTexts)

        setFieldStates((prev) => ({
          ...prev,
          [fieldName]: { status: "suggested", aiCorrectedText: result },
        }))
      } catch (error) {
        console.error(`[v0] AI re-correction error for ${fieldName}:`, error)
        alert("서버 오류로 AI 교정에 실패했어요. 다시 시도해주세요.")
        setFieldStates((prev) => ({
          ...prev,
          [fieldName]: { status: "idle" },
        }))
      } finally {
        setIsAiCorrecting(false)
      }
    },
    [title, problem, solution, expectedEffect],
  )

  const handleConfirmField = useCallback((fieldName: "problem" | "method" | "effect") => {
    setFieldStates((prev) => ({
      ...prev,
      [fieldName]: { status: "confirmed" },
    }))
    setFocusedField(null)
  }, [])

  const handleSubmit = async () => {
    if (isSubmitting) return

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/signup")
      return
    }

    if (resolvedRid === null) {
      alert("지역 정보를 확인할 수 없어요. 다시 시도해 주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const payload: CreateProposalDto = {
        rid: resolvedRid,
        title: title.trim(),
        eid: selectedExamples.length > 0 ? selectedExamples[0] : null,
        problem: problem.trim(),
        method: solution.trim(),
        effect: expectedEffect.trim(),
        tags: selectedCategories,
      }

      const result = await createProposal(payload)

      router.replace(`/proposals/${result.pid}`)
    } catch (error) {
      console.error("[v0] Error submitting proposal:", error)
      if (error instanceof Error) {
        alert(`제안 등록 중 오류가 발생했습니다: ${error.message}`)
      } else {
        alert("오류가 발생했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / 4) * 100

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")

    if (categoryFromUrl) {
      const validCategories: Exclude<PolicyCategory, "전체">[] = POLICY_CATEGORIES.filter(
        (c): c is Exclude<PolicyCategory, "전체"> => c !== "전체",
      )

      if ((validCategories as readonly string[]).includes(categoryFromUrl)) {
        setSelectedCategories([categoryFromUrl as Exclude<PolicyCategory, "전체">])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getGuideList = (): string[] => {
    if (!guidelinesData?.guidelines) return []
    const { guide_1, guide_2, guide_3, guide_4 } = guidelinesData.guidelines
    return [guide_1, guide_2, guide_3, guide_4].filter((g) => g && g.trim() !== "")
  }

  const getSelectedExamplesList = (): ExampleSummary[] => {
    if (!guidelinesData?.examples) return []
    return guidelinesData.examples.filter((ex) => selectedExamples.includes(ex.id))
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {isAiCorrecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#b4a0e5]" style={{ animationDelay: "0ms" }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#b4a0e5]" style={{ animationDelay: "150ms" }} />
              <div className="h-3 w-3 animate-bounce rounded-full bg-[#b4a0e5]" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-lg font-semibold text-gray-700">AI가 글을 교정하고 있어요</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => (currentStep === 1 ? router.back() : setCurrentStep((currentStep - 1) as Step))}
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
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
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
              <label className="block text-base font-semibold text-gray-900">어느 지역에 제안하시나요?</label>
              <div className="relative">
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-base text-gray-900 focus:border-[#b4a0e5] focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
                >
                  <option value="" disabled>
                    지역 선택
                  </option>
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
              <label className="block text-base font-semibold text-gray-900">정책 제안 제목을 입력해주세요.</label>
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
                {POLICY_CATEGORIES.filter((c) => c !== "전체").map((category) => (
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

            <p className="text-base font-semibold text-gray-900">어떤 문제를 해결하고 싶으신가요?</p>

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

            {isGuidelinesLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#b4a0e5]" />
                <p className="text-sm text-gray-500">가이드를 불러오는 중...</p>
              </div>
            )}

            {guidelinesError && !isGuidelinesLoading && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="text-sm text-red-700">{guidelinesError}</p>
                <button
                  onClick={() => fetchGuidelines(true)}
                  className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  다시 시도
                </button>
              </div>
            )}

            {!isGuidelinesLoading && !guidelinesError && guidelinesData && (
              <>
                {/* AI Recommended Examples */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-900">AI의 추천 사례</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    비슷한 문제를 해결한 사례를 찾았어요.
                    <br />
                    아래 사례를 참고해서 우리 지역에 맞는 해결책을 만들어보세요.
                  </p>

                  <div className="space-y-3">
                    {guidelinesData.examples.map((example) => (
                      <button
                        key={example.id}
                        onClick={() => toggleExample(example.id)}
                        className="relative w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition-all hover:border-[#b4a0e5] hover:bg-white"
                      >
                        <div className="mb-3 pr-8">
                          <p className="text-sm font-medium leading-snug text-gray-900">{example.title}</p>
                          {example.sim !== undefined && (
                            <p className="mt-1 text-xs text-gray-400">유사도: {(example.sim * 100).toFixed(0)}%</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
                            {example.region}
                          </span>
                          {example.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="rounded-full bg-[#b4a0e5] px-3 py-1 text-xs font-medium text-gray-900"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                        {selectedExamples.includes(example.id) && (
                          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#b4a0e5]">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                    {guidelinesData.examples.length === 0 && (
                      <p className="text-sm text-gray-500 py-4 text-center">추천 사례가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* AI Writing Guide */}
                <div className="space-y-3 rounded-xl bg-[#b4a0e5] p-5">
                  <h3 className="text-base font-bold text-gray-900">AI 제안서 작성 가이드</h3>
                  <ul className="space-y-1.5 text-sm leading-relaxed text-gray-900">
                    {getGuideList().map((guide, idx) => (
                      <li key={idx}>• {guide}</li>
                    ))}
                    {getGuideList().length === 0 && <li>• 가이드 정보가 없습니다.</li>}
                  </ul>
                </div>
              </>
            )}

            {/* Solution Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">문제를 어떻게 해결할 수 있을까요?</label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="예:&#10;• 옥천읍의 학교 및 아파트 근처에 자전거 반납소 설치&#10;• 대전시 타슈처럼 옥천읍의 공용 자전거 앱을 만들어서 관리"
                className="min-h-[180px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
              />
            </div>

            {/* Expected Effect Input */}
            <div className="space-y-3">
              <label className="block text-base font-semibold text-gray-900">기대되는 효과는 무엇인가요?</label>
              <textarea
                value={expectedEffect}
                onChange={(e) => setExpectedEffect(e.target.value)}
                placeholder="예:&#10;• 아이들의 도로 교통 교육 가능&#10;• 버스 외의 대중교통으로 이동성 보장"
                className="min-h-[180px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-[#b4a0e5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b4a0e5]/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: Final Summary - AI 교정 기능 통합 */}
        {currentStep === 4 && (
          <div className="space-y-6">
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

            {/* Summary Sections - with AI editable fields */}
            <div className="space-y-6 rounded-2xl bg-gray-50 p-5">
              {/* 1. 문제 정의 */}
              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">1. 문제 정의</h4>
                <AiEditableField
                  value={problem}
                  onChange={setProblem}
                  status={fieldStates.problem.status}
                  aiCorrectedText={fieldStates.problem.aiCorrectedText}
                  onFocus={() => setFocusedField("problem")}
                  onBlur={() => {}}
                  isFocused={focusedField === "problem"}
                  placeholder="문제를 입력해주세요"
                />
                {focusedField === "problem" && fieldStates.problem.status === "suggested" && (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleReCorrectField("problem")}
                      disabled={isAiCorrecting}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      다시 교정받기
                    </button>
                    <button
                      onClick={() => handleConfirmField("problem")}
                      className="rounded-lg bg-[#b4a0e5] px-4 py-2 text-sm font-bold text-gray-900 hover:bg-[#a693d9] transition-colors"
                    >
                      확정하기
                    </button>
                  </div>
                )}
              </div>

              {/* 2. 관련 정책 사례 */}
              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">2. 관련 정책 사례</h4>
                {getSelectedExamplesList().length > 0 ? (
                  <div className="space-y-3">
                    {getSelectedExamplesList().map((example) => (
                      <div key={example.id} className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="mb-3 text-sm font-medium leading-snug text-gray-900">{example.title}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900">
                            {example.region}
                          </span>
                          {example.categories.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="rounded-full bg-[#b4a0e5] px-3 py-1 text-xs font-medium text-gray-900"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">관련 정책 사례가 아직 없습니다.</p>
                )}
              </div>

              {/* 3. 해결 방안 제시 */}
              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">3. 해결 방안 제시</h4>
                <AiEditableField
                  value={solution}
                  onChange={setSolution}
                  status={fieldStates.method.status}
                  aiCorrectedText={fieldStates.method.aiCorrectedText}
                  onFocus={() => setFocusedField("method")}
                  onBlur={() => {}}
                  isFocused={focusedField === "method"}
                  placeholder="해결 방안을 입력해주세요"
                />
                {focusedField === "method" && fieldStates.method.status === "suggested" && (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleReCorrectField("method")}
                      disabled={isAiCorrecting}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      다시 교정받기
                    </button>
                    <button
                      onClick={() => handleConfirmField("method")}
                      className="rounded-lg bg-[#b4a0e5] px-4 py-2 text-sm font-bold text-gray-900 hover:bg-[#a693d9] transition-colors"
                    >
                      확정하기
                    </button>
                  </div>
                )}
              </div>

              {/* 4. 기대 효과 */}
              <div>
                <h4 className="mb-3 text-base font-bold text-gray-900">4. 기대 효과</h4>
                <AiEditableField
                  value={expectedEffect}
                  onChange={setExpectedEffect}
                  status={fieldStates.effect.status}
                  aiCorrectedText={fieldStates.effect.aiCorrectedText}
                  onFocus={() => setFocusedField("effect")}
                  onBlur={() => {}}
                  isFocused={focusedField === "effect"}
                  placeholder="기대 효과를 입력해주세요"
                />
                {focusedField === "effect" && fieldStates.effect.status === "suggested" && (
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => handleReCorrectField("effect")}
                      disabled={isAiCorrecting}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      다시 교정받기
                    </button>
                    <button
                      onClick={() => handleConfirmField("effect")}
                      className="rounded-lg bg-[#b4a0e5] px-4 py-2 text-sm font-bold text-gray-900 hover:bg-[#a693d9] transition-colors"
                    >
                      확정하기
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Correction Button (Floating) */}
            <button
              onClick={handleAiCorrectAll}
              disabled={isAiCorrecting}
              className="fixed bottom-28 right-6 z-20 flex flex-col items-center justify-center gap-1 rounded-full bg-[#b4a0e5] px-4 py-3 shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-900"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-xs font-bold text-gray-900">AI 교정</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white p-4">
        <button
          onClick={currentStep === 4 ? handleSubmit : handleNext}
          disabled={!canProceed() || (currentStep === 4 && isSubmitting)}
          className={`w-full rounded-xl py-4 text-center text-base font-bold transition-all ${
            canProceed() && !isSubmitting
              ? "bg-[#b4a0e5] text-gray-900 hover:bg-[#a693d9] active:scale-98"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {currentStep === 4 ? (isSubmitting ? "게시 중..." : "게시하기") : "다음 단계"}
        </button>
      </div>
    </div>
  )
}
