# Google Form 이메일 수집 연결 가이드

## 1단계: Google Form 생성

1. https://forms.google.com 접속
2. **+ 빈 양식** 클릭
3. 폼 제목: `BTS 미래역량 검사 — 결정 리포트 알림 신청`

## 2단계: 필드 추가

### 필드 1: 이메일
- 유형: **단답형**
- 질문: `이메일`
- 필수 체크 ✅

### 필드 2: 역량 유형
- 유형: **단답형**  
- 질문: `역량 유형`
- 필수 해제

## 3단계: entry ID 확인

1. 폼 미리보기(👁️ 아이콘) 클릭
2. 브라우저 주소창의 URL에서 `/viewform` 확인
3. **페이지 소스 보기** (Ctrl+U)
4. `entry.` 로 검색 → 각 필드의 entry ID를 복사
   - 예: `entry.1234567890` (이메일 필드)
   - 예: `entry.9876543210` (역량 유형 필드)

## 4단계: 폼 action URL 확인

1. 미리보기 URL에서 `/viewform` → `/formResponse` 로 변경
2. 예: `https://docs.google.com/forms/d/e/1FAIpQLSe.../formResponse`

## 5단계: 코드에 반영

`bts-assessment-site.html` 에서 아래 3줄을 찾아 교체:

```javascript
const GOOGLE_FORM_URL = ''; // ← 여기에 formResponse URL 입력
const GOOGLE_FORM_EMAIL_FIELD = 'entry.0000000'; // ← 이메일 entry ID
const GOOGLE_FORM_TYPE_FIELD = 'entry.0000001';  // ← 유형 entry ID
```

예시:
```javascript
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSe.../formResponse';
const GOOGLE_FORM_EMAIL_FIELD = 'entry.1234567890';
const GOOGLE_FORM_TYPE_FIELD = 'entry.9876543210';
```

## 6단계: 재배포

```bash
# 소스 파일 복사 → 배포 폴더
cp bts-assessment-site.html ../bts-assessment-deploy/index.html

# 재배포
cd ../bts-assessment-deploy
npx vercel --prod --yes
```

## 7단계: 확인

1. 검사 완료 후 결과 화면에서 이메일 입력
2. 마케팅 동의 체크 → "알림 신청하기" 클릭
3. Google Forms 응답 탭에서 수신 확인

## 참고
- Google Form은 CORS 없이 iframe POST 방식으로 전송
- 폼 URL이 비어있으면(`''`) UI 피드백만 표시하고 실제 전송은 하지 않음
- 이메일은 검사 데이터와 별개로 사용자의 자발적 입력만 수집
