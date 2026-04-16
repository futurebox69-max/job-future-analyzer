// src/components/bts/ProfileForm.tsx
'use client'

import { useState } from 'react'
import type { BtsProfile } from '@/lib/bts/types'

interface Props {
  onSubmit: (profile: BtsProfile) => void
}

const AGE_OPTIONS = [
  { value: '10s', label: '10대' },
  { value: '20s', label: '20대' },
  { value: '30s', label: '30대' },
  { value: '40s', label: '40대' },
  { value: '50s', label: '50대' },
  { value: '60plus', label: '60대 이상' },
] as const

export default function ProfileForm({ onSubmit }: Props) {
  const [gender, setGender] = useState<BtsProfile['gender'] | ''>('')
  const [ageGroup, setAgeGroup] = useState<BtsProfile['ageGroup'] | ''>('')
  const [occupation, setOccupation] = useState('')

  const isValid = gender && ageGroup && occupation.trim().length > 0

  const handleSubmit = () => {
    if (!isValid) return
    onSubmit({ gender: gender as BtsProfile['gender'], ageGroup: ageGroup as BtsProfile['ageGroup'], occupation: occupation.trim() })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 text-center">
        당신에게 맞는 리포트를 준비합니다.
      </p>

      {/* 성별 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
        <div className="flex gap-3">
          {([['male', '남성'], ['female', '여성'], ['other', '기타']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setGender(v)}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-colors ${
                gender === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">연령대</label>
        <div className="grid grid-cols-3 gap-2">
          {AGE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setAgeGroup(value)}
              className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                ageGroup === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 직업 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">직업</label>
        <input
          type="text"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
          placeholder="예: 개발자, 교사, 학생, 자영업..."
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />
      </div>

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
          isValid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        검사 시작 →
      </button>
    </div>
  )
}
