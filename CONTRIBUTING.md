# Contributing

## 타입 체크

라우트 파일(예: `app/api/*/route.ts`)을 삭제한 후에는 `.next` 폴더에 stale import가 남아 `tsc --noEmit`이 실패할 수 있습니다.

### 해결 방법

\`\`\`bash
# .next 폴더 삭제 후 타입 체크
npm run typecheck:clean

# 또는 수동으로
rm -rf .next
npm run typecheck
\`\`\`

### 스크립트 설명

| 스크립트 | 설명 |
|---------|------|
| `npm run typecheck` | 타입 체크만 실행 |
| `npm run typecheck:clean` | `.next` 폴더 삭제 후 타입 체크 |

## CI에서 사용

CI 환경에서는 항상 `typecheck:clean`을 사용하는 것을 권장합니다:

\`\`\`yaml
# GitHub Actions 예시
- name: Type Check
  run: npm run typecheck:clean
