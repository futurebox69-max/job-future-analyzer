// src/components/bts/TestProgress.tsx
'use client'

import { useEffect, useState } from 'react'

interface Props {
  current: number        // 0-based
  total: number
  timeLimit: number      // seconds
  onTimeout: () => void
}

export default function TestProgress({ current, total, timeLimit, onTimeout }: Props) {
  const [remaining, setRemaining] = useState(timeLimit)

  useEffect(() => {
    setRemaining(timeLimit)
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [current, timeLimit, onTimeout])

  const pct = ((current + 1) / total) * 100

  return (
    <div className="mb-6">
      {/* 진행 바 */}
      <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
        <span>{current + 1} / {total}</span>
        <span className={remaining <= 10 ? 'text-red-500 font-bold' : ''}>{remaining}초</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
