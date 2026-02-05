import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MD 대시보드 | 업체 관리 시스템',
  description: 'MD별 업체 관리 및 폼 접수 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
