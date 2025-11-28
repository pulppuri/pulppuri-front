"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiFetch, fetchRegionId, createGuideline, API_CONFIG } from "@/lib/api"

export default function ApiTestPage() {
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (msg: string) => {
    setResults((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  // GET /regions 테스트
  const testGetRegions = async () => {
    setIsLoading(true)
    try {
      addResult("GET /regions 요청 중...")
      const data = await apiFetch<{ items: Array<{ id: number; display_name: string }> }>("/regions?q=옥천&page=1")
      addResult(`성공! ${data.items?.length || 0}개 지역 조회됨`)
      if (data.items?.[0]) {
        addResult(`첫 번째 결과: id=${data.items[0].id}, name=${data.items[0].display_name}`)
      }
    } catch (e) {
      addResult(`실패: ${e instanceof Error ? e.message : String(e)}`)
    }
    setIsLoading(false)
  }

  // fetchRegionId 테스트
  const testFetchRegionId = async () => {
    setIsLoading(true)
    try {
      addResult("fetchRegionId('옥천읍') 요청 중...")
      const rid = await fetchRegionId("옥천읍")
      addResult(`결과: rid = ${rid}`)
    } catch (e) {
      addResult(`실패: ${e instanceof Error ? e.message : String(e)}`)
    }
    setIsLoading(false)
  }

  // POST /users 테스트
  const testPostUsers = async () => {
    setIsLoading(true)
    try {
      addResult("POST /users 요청 중...")
      const data = await apiFetch<{ token: string }>("/users", {
        method: "POST",
        body: {
          nickname: "테스트유저",
          age: 25,
          gender: "남성",
          job: "학생",
          rid: 1,
        },
      })
      addResult(`성공! token = ${data.token}`)
      localStorage.setItem("access_token", data.token)
      addResult("access_token 저장 완료")
    } catch (e) {
      addResult(`실패: ${e instanceof Error ? e.message : String(e)}`)
    }
    setIsLoading(false)
  }

  // POST /guidelines 테스트 (인증 필요)
  const testPostGuidelines = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        addResult("access_token이 없습니다. 먼저 POST /users를 테스트하세요.")
        setIsLoading(false)
        return
      }
      addResult(`POST /guidelines 요청 중... (Authorization: ${token.substring(0, 20)}...)`)
      const data = await createGuideline({
        title: "테스트 가이드라인",
        content: "테스트 내용입니다.",
      })
      addResult(`성공! 응답: ${JSON.stringify(data)}`)
    } catch (e) {
      addResult(`실패: ${e instanceof Error ? e.message : String(e)}`)
    }
    setIsLoading(false)
  }

  const clearResults = () => setResults([])
  const clearToken = () => {
    localStorage.removeItem("access_token")
    addResult("access_token 삭제됨")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">API 연동 테스트</h1>
        <p className="text-gray-600 mb-4">백엔드 URL: {API_CONFIG.BASE_URL}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={testGetRegions} disabled={isLoading}>
            GET /regions
          </Button>
          <Button onClick={testFetchRegionId} disabled={isLoading}>
            fetchRegionId
          </Button>
          <Button onClick={testPostUsers} disabled={isLoading}>
            POST /users
          </Button>
          <Button onClick={testPostGuidelines} disabled={isLoading} variant="secondary">
            POST /guidelines (인증)
          </Button>
          <Button onClick={clearToken} variant="outline">
            Token 삭제
          </Button>
          <Button onClick={clearResults} variant="ghost">
            로그 지우기
          </Button>
        </div>

        <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm min-h-[300px] overflow-auto">
          {results.length === 0 ? (
            <p className="text-gray-500">버튼을 클릭하여 API 테스트를 시작하세요.</p>
          ) : (
            results.map((r, i) => <div key={i}>{r}</div>)
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>* 백엔드가 실행 중이어야 합니다: uvicorn --reload --port 8000</p>
          <p>* access_token은 localStorage에 저장됩니다.</p>
        </div>
      </div>
    </div>
  )
}
