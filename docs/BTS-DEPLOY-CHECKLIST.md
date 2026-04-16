# BTS 분석 MVP — 배포 전 수동 검증 체크리스트

## 사전 준비

- [ ] Supabase 대시보드에서 `supabase/migrations/001_bts_tables.sql` 실행
- [ ] `.env.local` 환경변수 설정 확인:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JOB_ANALYZER_API_KEY` (Claude API)
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY` (토스 테스트 클라이언트 키)
  - `TOSS_SECRET_KEY` (토스 테스트 시크릿 키)
- [ ] Vercel 환경변수에도 동일하게 설정 (NEXT_PUBLIC_ 제외한 키는 서버 전용)

## 검증 시나리오 (8개)

### 1. 결제 성공
- [ ] `/bts` → CTA 클릭 → Google 로그인 → 프로필 입력 → 6문항 진행
- [ ] `/bts/result` 에서 무료 결과 확인 (점수, 유형, 강점/주의, 한마디)
- [ ] "왜 이런 결과가 나왔는지 알아보기 → 12,900원" 클릭
- [ ] `/bts/report` 에서 결제 버튼 클릭 → 토스 결제창 표시
- [ ] 테스트 카드로 결제 완료
- [ ] `/bts/report/view` 에서 "결제 확인 중" → "리포트 생성 중" → 리포트 표시
- [ ] 리포트 5섹션 확인: 구조 해석, 약점 3개, 위험 3개, 훈련 3개, 행동 제안

### 2. 결제 취소
- [ ] `/bts/report` → 결제 버튼 → 토스 결제창에서 취소
- [ ] `/bts/report?error=payment_failed` 리다이렉트 확인
- [ ] "결제가 완료되지 않았습니다" 빨간 배너 표시

### 3. 결제 실패
- [ ] 토스 테스트 환경에서 결제 실패 시뮬레이션
- [ ] DB에서 `purchase_status = 'payment_failed'` 확인
- [ ] 재시도 시 새 pending 주문이 생성되는지 확인

### 4. Claude 리포트 생성 실패
- [ ] (시뮬레이션: JOB_ANALYZER_API_KEY를 임시로 잘못된 값으로 변경)
- [ ] 결제 성공 후 리포트 생성 단계에서 에러 표시
- [ ] DB에서 `report_status = 'generation_failed'` 확인
- [ ] `purchase_status`는 `paid`로 유지되는지 확인
- [ ] (API 키 복원 후) "리포트 다시 생성" 버튼 클릭 → 리포트 정상 표시

### 5. 리포트 재시도
- [ ] 위 #4 시나리오에서 재시도 성공 확인
- [ ] DB에서 `report_status`가 `generation_failed` → `generating` → `completed`로 변경 확인
- [ ] `purchase_status`는 계속 `paid` 유지

### 6. URL 조작
- [ ] `/bts/result?id=존재하지않는UUID` → "결과를 불러오는 중..." 무한 또는 에러
- [ ] `/bts/report/view?orderId=fake&paymentKey=fake&amount=12900` → 서버에서 401/404 에러
- [ ] `/bts/report?id=타인의assessmentId` → 결제 페이지는 보이지만, 결제 시 타인 assessment에는 접근 불가
- [ ] 브라우저 개발자 도구에서 `SUPABASE_SERVICE_ROLE_KEY`가 노출되지 않는지 확인

### 7. 타인 assessment 접근
- [ ] 사용자 A가 검사 → assessment_id 획득
- [ ] 사용자 B로 로그인 → `/bts/result?id=A의assessment_id`
  - RLS에 의해 데이터 조회 실패 (결과 없음)
- [ ] 사용자 B → `/api/bts/report` POST with A의 assessmentId
  - 서버에서 `assessment.user_id !== user.id` → 403 Forbidden

### 8. 중복 주문
- [ ] 동일 assessment에 대해 결제 버튼 2번 클릭 → pending 주문 1개만 재사용
- [ ] 결제 완료 후 `/bts/report?id=같은assessmentId` 재접근 → 결제 페이지 대신 리포트 뷰로 리다이렉트
- [ ] DB에서 `purchase_status = 'paid'`인 행이 같은 (user_id, assessment_id, product_type) 조합으로 1개만 존재
  - unique index `idx_bts_purchases_unique_paid`에 의해 강제

## 검증 완료 후

- [ ] 토스 테스트키 → 라이브키 교체
- [ ] Vercel 배포
- [ ] 프로덕션 환경에서 #1(결제 성공) 시나리오 1회 실행
