// src/app/bts/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BTS 분석 | 나는 미래에 얼마나 준비된 사람인가',
  description: '성격이 아니라 준비 상태를 봅니다. 3분이면 당신의 통찰 구조가 보입니다.',
}

export default function BtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {children}
    </div>
  )
}
