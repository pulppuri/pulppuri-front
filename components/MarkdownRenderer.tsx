import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import type { Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string | null | undefined
  className?: string
}

// 커스텀 컴포넌트 매핑 (HTML 렌더링 금지, XSS 방지)
const components: Components = {
  // 헤딩
  h1: ({ children }) => <h1 className="mb-4 mt-6 text-2xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-5 text-xl font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-semibold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-3 text-base font-semibold first:mt-0">{children}</h4>,
  // 단락
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  // 리스트
  ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  // 링크 (새 탭)
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-[#7c5cff] underline underline-offset-2 hover:text-[#6a4de0]"
    >
      {children}
    </a>
  ),
  // 굵게/기울임
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  // 인용
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-[#b4a0e5] pl-4 italic text-muted-foreground">{children}</blockquote>
  ),
  // 코드
  code: ({ children, className }) => {
    // 인라인 코드 vs 코드 블록 구분
    const isBlock = className?.includes("language-")
    if (isBlock) {
      return <code className="block overflow-x-auto rounded-lg bg-muted p-4 text-sm">{children}</code>
    }
    return <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{children}</code>
  },
  pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-lg bg-muted">{children}</pre>,
  // 테이블 (GFM)
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse border border-border text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
  th: ({ children }) => <th className="border border-border px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
  // 수평선
  hr: () => <hr className="my-4 border-t border-border" />,
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || content.trim() === "") {
    return <p className="text-muted-foreground">내용이 없습니다</p>
  }

  return (
    <div className={`max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
        // HTML 렌더링 금지 (XSS 방지) - react-markdown v9+는 기본적으로 HTML을 렌더링하지 않음
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
