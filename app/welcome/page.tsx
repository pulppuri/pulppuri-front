"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from 'next/navigation'

export default function WelcomePage() {
  const router = useRouter()

  const handleStart = () => {
    router.push("/signup")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-background p-6">
      <div className="flex w-full max-w-md flex-1 flex-col items-center justify-center gap-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <Image src="/images/logo.png" alt="옥천 한입" width={180} height={72} priority />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground">지역 정책 참여 플랫폼</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              우수 정책을 공유하고
              <br />
              지역을 직접 바꿔나가세요
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <Card className="w-full bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4">
            <FeatureItem icon="📋" title="정책 사례" description="우수한 타 지역 정책을 살펴보세요" />
            <FeatureItem icon="💡" title="정책 제안" description="시민이 직접 정책을 제안하세요" />
            <FeatureItem icon="👤" title="마이페이지" description="내 활동을 관리하세요" />
          </div>
        </Card>
      </div>

      {/* Action Button */}
      <div className="w-full max-w-md space-y-3 pb-8">
        <Button
          onClick={handleStart}
          className="h-14 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold shadow-lg"
        >
          시작하기
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          시작하기를 누르면 간단한 정보 입력 후 바로 이용할 수 있습니다
        </p>
      </div>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
