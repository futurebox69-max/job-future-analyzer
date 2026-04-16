// src/lib/bts/questions.ts
import type { InsightQuestion } from './types'
import { TEST_CONFIG } from './constants'

/**
 * 통찰력 검사 6문항 (범용, 테마팩 없음)
 *
 * 패턴 발견 (p1-p3): 데이터에서 규칙 찾기
 * - p1 → 이해력 (정보 파악)
 * - p2 → 이해력 (정보 파악)
 * - p3 → 분석력 (규칙 추출)
 *
 * 미래 예측 (f1-f3): 트렌드에서 다음 상황 예측
 * - f1 → 분석력 (데이터 근거)
 * - f2 → 예측력 (미래 방향)
 * - f3 → 예측력 (미래 방향)
 */
export const INSIGHT_QUESTIONS: InsightQuestion[] = [
  // ── 패턴 발견 1: 매출 데이터 패턴 (이해력) ──
  {
    id: 'p1',
    type: 'pattern',
    subScore: 'understand',
    prompt: '한 카페의 최근 6개월 매출 변화입니다:\n1월: 320만 → 2월: 280만 → 3월: 350만 → 4월: 290만 → 5월: 370만 → 6월: 300만',
    question: '이 데이터에서 읽을 수 있는 핵심 정보는?',
    options: [
      { id: 'A', text: '매출이 꾸준히 하락하고 있다', score: 0 },
      { id: 'B', text: '홀수 달에 오르고 짝수 달에 내리는 패턴이 반복되며, 전체적으로 소폭 상승 중이다', score: 100 },
      { id: 'C', text: '매출 변화에 특별한 패턴이 없다', score: 0 },
      { id: 'D', text: '3월 이후 꾸준히 상승 중이다', score: 60 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 패턴 발견 2: 이직률 데이터 (이해력) ──
  {
    id: 'p2',
    type: 'pattern',
    subScore: 'understand',
    prompt: '한 회사의 부서별 이직률입니다:\n영업팀: 25% → 개발팀: 8% → 마케팅: 22% → 인사팀: 6% → 고객지원: 28% → 재무팀: 5%',
    question: '이 데이터에서 가장 중요한 패턴은?',
    options: [
      { id: 'A', text: '모든 부서의 이직률이 높은 편이다', score: 0 },
      { id: 'B', text: '외부 고객을 직접 대면하는 부서일수록 이직률이 높다', score: 100 },
      { id: 'C', text: '이직률은 부서 규모에 따라 달라진다', score: 0 },
      { id: 'D', text: '영업팀과 고객지원팀의 이직률만 유독 높다', score: 60 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 패턴 발견 3: 기술 채택 주기 (분석력) ──
  {
    id: 'p3',
    type: 'pattern',
    subScore: 'analyze',
    prompt: '새로운 기술이 등장했을 때, 기업들의 도입 속도를 관찰했습니다:\n클라우드: 발표 후 7년 → 50% 채택\n스마트폰: 발표 후 5년 → 50% 채택\n생성형 AI: 발표 후 2년 → 50% 채택',
    question: '이 데이터에서 추출할 수 있는 규칙은?',
    options: [
      { id: 'A', text: '기술마다 채택 속도가 다르므로 규칙은 없다', score: 0 },
      { id: 'B', text: '새로운 기술일수록 초기 도입 비용이 낮아 채택이 빠르다', score: 60 },
      { id: 'C', text: '기술 채택 주기가 점점 빨라지고 있으며, 이 가속 추세 자체가 규칙이다', score: 100 },
      { id: 'D', text: '50% 채택까지 항상 비슷한 시간이 걸린다', score: 0 },
    ],
    timeLimitSeconds: TEST_CONFIG.PATTERN_TIME_LIMIT,
  },

  // ── 미래 예측 1: 원격근무 트렌드 (분석력) ──
  {
    id: 'f1',
    type: 'prediction',
    subScore: 'analyze',
    prompt: '한 IT 기업의 원격근무 비율 변화입니다:\n2020: 10% → 2021: 80% → 2022: 60% → 2023: 45% → 2024: 40% → 2025: 38%',
    question: '이 흐름이 계속된다면, 2027년 원격근무 비율에 대해 가장 근거가 탄탄한 판단은?',
    options: [
      { id: 'A', text: '완전 출근으로 돌아가 5% 이하가 된다', score: 0 },
      { id: 'B', text: '하락 속도가 점점 줄어들고 있으므로 30~35% 부근에서 안정화된다', score: 100 },
      { id: 'C', text: '다시 상승해 60% 이상이 된다', score: 0 },
      { id: 'D', text: '계속 비슷한 속도로 떨어져 20% 부근이 된다', score: 70 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },

  // ── 미래 예측 2: 동네 상권 변화 (예측력) ──
  {
    id: 'f2',
    type: 'prediction',
    subScore: 'predict',
    prompt: '한 동네에서 최근 3년간 일어난 변화입니다:\n- 대형 프랜차이즈 카페 3곳 입점\n- 1인 가구 비율 15% → 28%\n- 배달 주문 비율 20% → 55%\n- 동네 빵집·정육점 5곳 → 2곳으로 감소',
    question: '이 동네에서 3년 후 가장 일어날 가능성이 높은 변화는?',
    options: [
      { id: 'A', text: '전통 상점들이 다시 돌아와 상권이 회복된다', score: 0 },
      { id: 'B', text: '배달 전문 매장·공유 주방이 늘고, 체험형 매장만 오프라인으로 생존한다', score: 100 },
      { id: 'C', text: '대형 프랜차이즈가 더 늘어나 상권이 활성화된다', score: 40 },
      { id: 'D', text: '1인 가구가 늘면 오히려 동네 커뮤니티 공간 수요가 생긴다', score: 70 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },

  // ── 미래 예측 3: AI와 일자리 (예측력) ──
  {
    id: 'f3',
    type: 'prediction',
    subScore: 'predict',
    prompt: '최근 5년간 관찰된 변화입니다:\n- AI 번역기 정확도: 70% → 95%\n- 전문 번역가 수요: 100 → 40 (60% 감소)\n- AI 번역 후 교정 전문가 수요: 0 → 80 (신규 직종)\n- 번역 시장 전체 거래량: 100 → 250 (2.5배 성장)',
    question: '이 패턴이 다른 전문직(회계, 법률 문서 검토 등)에도 적용된다면, 가장 근거가 탄탄한 예측은?',
    options: [
      { id: 'A', text: 'AI가 전문직을 완전히 대체해 해당 직업이 사라진다', score: 0 },
      { id: 'B', text: '기존 전문가 수요는 줄지만, AI 결과물을 검증·보완하는 새 역할이 생기고, 전체 시장은 커진다', score: 100 },
      { id: 'C', text: '전문직은 AI의 영향을 거의 받지 않는다', score: 0 },
      { id: 'D', text: '전문가 수요가 줄어 시장 전체가 축소된다', score: 40 },
    ],
    timeLimitSeconds: TEST_CONFIG.PREDICTION_TIME_LIMIT,
  },
]
