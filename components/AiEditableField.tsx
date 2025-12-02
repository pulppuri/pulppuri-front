"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"
import DiffMatchPatch from "diff-match-patch"

export type FieldStatus = "idle" | "loading" | "suggested" | "confirmed"

interface AiEditableFieldProps {
  value: string
  onChange: (value: string) => void
  status: FieldStatus
  aiCorrectedText?: string
  onFocus?: () => void
  onBlur?: () => void
  isFocused?: boolean
  placeholder?: string
  className?: string
}

/**
 * AI 교정 하이라이트를 지원하는 contenteditable 필드
 * - AI가 수정한 부분은 파란색으로 표시
 * - 사용자가 파란색 부분을 수정하면 즉시 검은색으로 변경
 */
export default function AiEditableField({
  value,
  onChange,
  status,
  aiCorrectedText,
  onFocus,
  onBlur,
  isFocused,
  placeholder = "",
  className = "",
}: AiEditableFieldProps) {
  const editableRef = useRef<HTMLDivElement>(null)
  const dmp = useRef(new DiffMatchPatch())
  const lastAppliedAiText = useRef<string | null>(null)

  /**
   * diff를 기반으로 HTML 생성
   * - equal 부분: 일반 텍스트 (검정)
   * - insert 부분: AI span (파란색)
   */
  const generateDiffHtml = useCallback((baseline: string, corrected: string): string => {
    const diffs = dmp.current.diff_main(baseline, corrected)
    dmp.current.diff_cleanupSemantic(diffs)

    let html = ""
    for (const [op, text] of diffs) {
      const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")

      if (op === 0) {
        // DIFF_EQUAL: 변경 없음 - 일반 텍스트
        html += escapedText
      } else if (op === 1) {
        // DIFF_INSERT: AI가 추가한 부분 - 파란색 span
        html += `<span data-origin="ai" data-ai-text="${text.replace(/"/g, "&quot;")}" class="text-blue-600">${escapedText}</span>`
      }
      // op === -1 (DIFF_DELETE)는 corrected에 없으므로 렌더링하지 않음
    }

    return html
  }, [])

  /**
   * AI 교정 결과 적용
   */
  useEffect(() => {
    if (status === "suggested" && aiCorrectedText && editableRef.current) {
      // 이미 같은 AI 텍스트가 적용되었으면 스킵
      if (lastAppliedAiText.current === aiCorrectedText) {
        return
      }

      const baseline = value
      const html = generateDiffHtml(baseline, aiCorrectedText)
      editableRef.current.innerHTML = html
      lastAppliedAiText.current = aiCorrectedText

      // value도 corrected로 업데이트
      onChange(aiCorrectedText)
    }
  }, [status, aiCorrectedText, value, onChange, generateDiffHtml])

  /**
   * 확정 시 모든 AI 스타일 제거
   */
  useEffect(() => {
    if (status === "confirmed" && editableRef.current) {
      const spans = editableRef.current.querySelectorAll('span[data-origin="ai"]')
      spans.forEach((span) => {
        span.removeAttribute("data-origin")
        span.removeAttribute("data-ai-text")
        span.classList.remove("text-blue-600")
      })
      lastAppliedAiText.current = null
    }
  }, [status])

  /**
   * idle 상태에서 초기 value 설정
   */
  useEffect(() => {
    if (status === "idle" && editableRef.current && !editableRef.current.innerHTML) {
      const escapedValue = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
      editableRef.current.innerHTML = escapedValue || ""
    }
  }, [status, value])

  /**
   * 입력 처리 - AI span 수정 감지
   */
  const handleInput = useCallback(() => {
    if (!editableRef.current) return

    // AI span 순회하여 수정 여부 확인
    const aiSpans = editableRef.current.querySelectorAll('span[data-origin="ai"]')
    aiSpans.forEach((span) => {
      const originalText = span.getAttribute("data-ai-text")
      if (originalText !== null && span.textContent !== originalText) {
        // 사용자가 수정함 - AI 표시 해제
        span.removeAttribute("data-origin")
        span.removeAttribute("data-ai-text")
        span.classList.remove("text-blue-600")
      }
    })

    // innerText로 value 동기화 (HTML 태그 제거)
    const newValue = editableRef.current.innerText || ""
    onChange(newValue)
  }, [onChange])

  /**
   * 포커스 핸들러
   */
  const handleFocus = useCallback(() => {
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    onBlur?.()
  }, [onBlur])

  /**
   * 붙여넣기 시 plain text로 변환
   */
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  const showPlaceholder = !value && status === "idle"

  return (
    <div className="relative">
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={handlePaste}
        className={`min-h-[80px] w-full whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-900 outline-none transition-colors focus:border-[#b4a0e5] focus:bg-white focus:ring-2 focus:ring-[#b4a0e5]/20 ${className} ${isFocused ? "border-[#b4a0e5] bg-white ring-2 ring-[#b4a0e5]/20" : ""}`}
        style={{ wordBreak: "break-word" }}
      />
      {showPlaceholder && (
        <div className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400">{placeholder}</div>
      )}
    </div>
  )
}
