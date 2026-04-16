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
CREATE TABLE bts_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES bts_assessments(id) NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'deep_report',
  amount INTEGER NOT NULL,            -- 12900
  payment_key TEXT,                    -- 토스페이먼츠 결제키
  order_id TEXT UNIQUE NOT NULL,       -- 주문번호
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | completed | generating | failed | refunded
  report JSONB,                        -- 생성된 리포트 저장
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

-- 주의: status/report 업데이트는 서비스 역할(supabaseAdmin)로만 수행한다.
-- 서비스 역할은 RLS를 자동 우회하므로 별도 UPDATE 정책 불필요.
-- 일반 사용자의 UPDATE는 의도적으로 차단한다.

-- 인덱스
CREATE INDEX idx_bts_purchases_user ON bts_purchases(user_id);
CREATE INDEX idx_bts_purchases_order ON bts_purchases(order_id);
