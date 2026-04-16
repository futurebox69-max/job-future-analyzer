-- 002: 중복 active order 점검 및 정리
-- 이 파일은 001 마이그레이션 적용 후, unique index 생성 전에 실행합니다.
-- 기존 DB에 이미 테이블이 있는 경우에만 필요합니다.
-- 신규 배포(테이블 없음)라면 001만 실행하면 됩니다.

-- ────────────────────────────────────────────
-- STEP 1: 중복 active order 점검 (조회만, 변경 없음)
-- ────────────────────────────────────────────
-- 이 쿼리가 행을 반환하면 중복이 존재합니다.
-- 반환되는 행이 없으면 STEP 2는 건너뛰고 바로 인덱스를 생성하세요.

SELECT user_id, assessment_id, product_type,
       COUNT(*) AS active_count,
       array_agg(id ORDER BY created_at) AS purchase_ids,
       array_agg(purchase_status ORDER BY created_at) AS statuses
FROM bts_purchases
WHERE purchase_status IN ('pending', 'paid')
GROUP BY user_id, assessment_id, product_type
HAVING COUNT(*) > 1;

-- ────────────────────────────────────────────
-- STEP 2: 중복 pending 정리 (paid가 있으면 pending 제거)
-- ────────────────────────────────────────────
-- 주의: 이 DELETE는 실제 데이터를 삭제합니다.
-- 반드시 STEP 1 결과를 확인한 후 수동으로 실행하세요.

-- 2a. paid가 존재하는 조합에서 pending 제거
/*
DELETE FROM bts_purchases
WHERE id IN (
  SELECT p.id
  FROM bts_purchases p
  WHERE p.purchase_status = 'pending'
    AND EXISTS (
      SELECT 1 FROM bts_purchases p2
      WHERE p2.user_id = p.user_id
        AND p2.assessment_id = p.assessment_id
        AND p2.product_type = p.product_type
        AND p2.purchase_status = 'paid'
    )
);
*/

-- 2b. pending만 여러 개인 경우: 가장 최신 1개만 남기고 나머지 payment_failed로 변경
/*
UPDATE bts_purchases
SET purchase_status = 'payment_failed'
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY user_id, assessment_id, product_type
             ORDER BY created_at DESC
           ) AS rn
    FROM bts_purchases
    WHERE purchase_status = 'pending'
  ) ranked
  WHERE rn > 1
);
*/

-- ────────────────────────────────────────────
-- STEP 3: 기존 paid-only 인덱스 → active 인덱스로 교체
-- ────────────────────────────────────────────
-- 기존 인덱스가 있으면 삭제 후 새 인덱스 생성
DROP INDEX IF EXISTS idx_bts_purchases_unique_paid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bts_purchases_unique_active
  ON bts_purchases(user_id, assessment_id, product_type)
  WHERE purchase_status IN ('pending', 'paid');
