"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"

export default function SplashScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.userid) {
            console.log("[v0] User found in localStorage, auto-login:", user.userid)
            router.push("/policies")
            return
          }
        } catch (e) {
          console.error("[v0] Failed to parse user data:", e)
          localStorage.removeItem("user")
        }
      }
      
      console.log("[v0] No user found, redirecting to onboarding")
      setIsLoading(false)
      router.push("/signup")
    }

    const timer = setTimeout(checkAuth, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-primary/20">
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <Image src="/images/logo.png" alt="옥천 한입" width={200} height={80} priority className="animate-pulse" />
        {isLoading && (
          <div className="flex gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
          </div>
        )}
      </div>
    </div>
  )
}
