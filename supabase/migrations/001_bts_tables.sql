-- BTS 분석 검사 기록
CREATE TABLE bts_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile JSONB NOT NULL,            -- { gender, ageGroup, occupation }
  sub_scores JSONB NOT NULL,         -- { understand, analyze, predict }
  total_score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  answers JSONB NOT NULL,            -- UserAnswer[]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE bts_assessments ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회/삽입 가능
CREATE POLICY "Users can view own assessments"
  ON bts_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON bts_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_bts_assessments_user ON bts_assessments(user_id);

-- BTS 분석 구매 기록
-- purchase_status: 결제 처리만 추적
-- report_status: 리포트 생성만 추적
CREATE TABLE bts_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES bts_assessments(id) NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'deep_report',
  amount INTEGER NOT NULL,                              -- 12900
  payment_key TEXT,                                      -- 토스페이먼츠 결제키
  order_id TEXT UNIQUE NOT NULL,                         -- 주문번호
  purchase_status TEXT NOT NULL DEFAULT 'pending',       -- pending | paid | payment_failed | refunded
  report_status TEXT NOT NULL DEFAULT 'not_started',     -- not_started | generating | completed | generation_failed
  report JSONB,                                          -- 생성된 리포트 저장
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE bts_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON bts_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON bts_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 주의: purchase_status/report_status/report 업데이트는 서비스 역할(supabaseAdmin)로만 수행한다.
-- 서비스 역할은 RLS를 자동 우회하므로 별도 UPDATE 정책 불필요.
-- 일반 사용자의 UPDATE는 의도적으로 차단한다.

-- 중복 결제 방지: 같은 assessment에 대해 결제 완료된(paid) 구매가 1개만 존재하도록
-- payment_failed/refunded는 여러 개 허용 (재시도 가능)
-- partial unique index: purchase_status = 'paid'인 행만 유니크 제약
CREATE UNIQUE INDEX idx_bts_purchases_unique_paid
  ON bts_purchases(user_id, assessment_id, product_type)
  WHERE purchase_status = 'paid';

-- 인덱스
CREATE INDEX idx_bts_purchases_user ON bts_purchases(user_id);
CREATE INDEX idx_bts_purchases_order ON bts_purchases(order_id);
CREATE INDEX idx_bts_purchases_assessment ON bts_purchases(assessment_id, purchase_status);
