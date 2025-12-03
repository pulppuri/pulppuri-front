import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    // body validation: url이 없거나 빈 문자열이면 400
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 })
    }

    const trimmedUrl = url.trim()

    // 백엔드로 보낼 때는 { url } 기본 + 호환을 위해 { link, reference }도 같이 보냄
    const forwardBody = {
      url: trimmedUrl,
      link: trimmedUrl,
      reference: trimmedUrl,
    }

    console.log(`[api/autofill] Forwarding to ${BACKEND_URL}/autofill with body:`, forwardBody)

    const backendResponse = await fetch(`${BACKEND_URL}/autofill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(forwardBody),
    })

    const contentType = backendResponse.headers.get("content-type") ?? ""
    const responseText = await backendResponse.text()

    console.log(`[api/autofill] Backend status: ${backendResponse.status}, content-type: ${contentType}`)
    console.log(`[api/autofill] Backend response text:`, responseText)

    // 백엔드가 500을 반환하면 클라이언트에서 디버깅 가능하게 응답 텍스트를 그대로 내려줌
    if (!backendResponse.ok) {
      console.error(`[api/autofill] Backend error: ${backendResponse.status} - ${responseText}`)
      return new NextResponse(responseText, {
        status: backendResponse.status,
        headers: {
          "Content-Type": contentType || "text/plain",
        },
      })
    }

    // 백엔드 응답은 status, content-type을 최대한 보존해서 그대로 반환
    return new NextResponse(responseText, {
      status: backendResponse.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    })
  } catch (error) {
    console.error("[api/autofill] Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch from backend", details: String(error) }, { status: 500 })
  }
}
