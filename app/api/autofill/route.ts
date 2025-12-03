import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function normalizeResponse(text: string, contentType: string): { data: unknown; isJson: boolean } {
  const trimmed = text.trim()

  // Try JSON parse first
  if (contentType.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return { data: JSON.parse(trimmed), isJson: true }
    } catch {
      // Fall through to text handling
    }
  }

  // Plain text - wrap in { summary }
  if (trimmed) {
    return { data: { summary: trimmed }, isJson: true }
  }

  return { data: { error: "Empty response from backend" }, isJson: true }
}

function createErrorResponse(
  status: number,
  message: string,
  details?: { url?: string; error?: string; type?: string },
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...details,
    },
    { status },
  )
}

export async function POST(request: NextRequest) {
  let requestUrl = ""

  try {
    const body = await request.json()
    const { url } = body
    requestUrl = url

    // body validation: url이 없거나 빈 문자열이면 400
    if (!url || typeof url !== "string" || !url.trim()) {
      return createErrorResponse(400, "url is required")
    }

    const trimmedUrl = url.trim()

    // URL 유효성 검사
    try {
      new URL(trimmedUrl)
    } catch {
      return createErrorResponse(400, "Invalid URL format", { url: trimmedUrl })
    }

    // 백엔드로 보낼 때는 { url } 기본 + 호환을 위해 { link, reference }도 같이 보냄
    const forwardBody = {
      url: trimmedUrl,
      link: trimmedUrl,
      reference: trimmedUrl,
    }

    console.log(`[api/autofill] Forwarding to ${BACKEND_URL}/autofill with body:`, forwardBody)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    let backendResponse: Response
    try {
      backendResponse = await fetch(`${BACKEND_URL}/autofill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forwardBody),
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)

      if (errorMessage.includes("aborted")) {
        return createErrorResponse(504, "Backend request timeout", {
          url: trimmedUrl,
          error: "Request took too long (>30s)",
          type: "TimeoutError",
        })
      }

      return createErrorResponse(502, "Failed to connect to backend", {
        url: trimmedUrl,
        error: errorMessage,
        type: fetchError instanceof Error ? fetchError.constructor.name : "FetchError",
      })
    }

    clearTimeout(timeoutId)

    const contentType = backendResponse.headers.get("content-type") ?? ""
    const responseText = await backendResponse.text()

    console.log(`[api/autofill] Backend status: ${backendResponse.status}, content-type: ${contentType}`)
    console.log(`[api/autofill] Backend response text:`, responseText.slice(0, 500))

    if (!backendResponse.ok) {
      console.error(`[api/autofill] Backend error: ${backendResponse.status} - ${responseText.slice(0, 500)}`)

      // Try to extract error details from backend response
      let errorDetail: string = responseText
      let errorType = "BackendError"

      try {
        const parsed = JSON.parse(responseText)
        if (parsed.detail) {
          if (typeof parsed.detail === "string") {
            errorDetail = parsed.detail
          } else if (typeof parsed.detail === "object") {
            errorDetail = parsed.detail.message || parsed.detail.error || JSON.stringify(parsed.detail)
            errorType = parsed.detail.type || errorType
          }
        } else if (parsed.error) {
          errorDetail = parsed.error
        } else if (parsed.message) {
          errorDetail = parsed.message
        }
      } catch {
        // Keep responseText as-is
      }

      return createErrorResponse(
        backendResponse.status === 500 ? 502 : backendResponse.status,
        "Backend autofill failed",
        {
          url: trimmedUrl,
          error: errorDetail.slice(0, 500),
          type: errorType,
        },
      )
    }

    const { data } = normalizeResponse(responseText, contentType)

    console.log(`[api/autofill] Normalized response:`, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[api/autofill] Proxy error:", error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    return createErrorResponse(500, "Autofill proxy error", {
      url: requestUrl,
      error: errorMessage,
      type: error instanceof Error ? error.constructor.name : "UnknownError",
    })
  }
}
