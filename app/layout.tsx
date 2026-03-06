import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Statfordegree Hub',
  description: '팀 업무 관리와 메뉴얼 정리를 위한 지식관리 시스템',
  openGraph: {
    title: 'Statfordegree Hub',
    description: '팀 업무 관리와 메뉴얼 정리를 위한 지식관리 시스템',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased h-full bg-white text-neutral-900">{children}</body>
    </html>
  )
}
