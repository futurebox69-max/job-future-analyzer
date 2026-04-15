# BTS 미래역량 검사 사이트 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 `bts-assessment-site.html` (886줄)에 7가지 개선을 추가하여 독립형 검사 MVP를 완성한다.

**Architecture:** 단일 HTML 파일, 클라이언트 사이드 전용, 서버 없음. 기존 SPA 스크린 시스템(landing→qtype→assess→result) 위에 로딩 스크린을 추가하고, 결과 화면을 전환 퍼널 순서로 재구성한다.

**Tech Stack:** HTML/CSS/JS (순수), SVG (게이지/차트), Google Fonts CDN (Noto Sans KR)

**Spec:** `docs/superpowers/specs/2026-04-15-assessment-mvp-design.md`

**Briefing:** `ASSESSMENT-MVP-BRIEFING.md`

**기존 파일:** `bts-assessment-site.html` (886줄)

---

## File Structure

단일 파일 수정이므로 파일 분해는 없다. 모든 변경은 `bts-assessment-site.html` 내에서 이루어진다.

| 파일 | 작업 |
|------|------|
| `bts-assessment-site.html` | 수정 (886줄 → ~1,500~1,800줄) |

---

## Task 1: 용어 수정 + 메타태그 업데이트

가장 작은 변경부터 시작. "측정" → "탐색" 용어 통일, 연도 2025→2026, OG 메타태그 추가.

**Files:**
- Modify: `bts-assessment-site.html`

- [ ] **Step 1: 용어 변경 "측정" → "탐색"**

모든 사용자 대면 텍스트에서 "측정" → "탐색" 교체. 대상 위치:
```
라인 6: <title> 태그 — "경쟁력을 측정하세요" → "경쟁력을 탐색하세요"
라인 192: hero-badge — "AI 시대 역량 측정" → "AI 시대 역량 탐색"
라인 194: hero 설명 — "게임처럼 재미있게 측정합니다" → "게임처럼 재미있게 탐색합니다"
라인 196: hero-stat-label — "측정 역량" → "탐색 역량"
라인 207: WHY section-desc — "준비되었는지 측정합니다" → "준비되었는지 탐색합니다"
라인 227: WHY card — "실제 역량을 측정합니다" → "실제 역량을 탐색합니다"
라인 245: section-desc — "6차원으로 측정합니다" → "6차원으로 탐색합니다"
라인 326: section-title — "검증된 프레임워크" → "검증된 학술 프레임워크 기반 설계" (기획서 반영)
```

참고: 위 목록 외에도 "측정"이 있으면 모두 "탐색"으로 변경한다. 전체 검색(Ctrl+F)으로 확인.

- [ ] **Step 2: 연도 업데이트**

```
라인 349: © 2025 → © 2026
라인 420: © 2025 → © 2026
```

- [ ] **Step 3: OG 메타태그 추가**

`<head>` 섹션, `<title>` 바로 아래에 추가:
```html
<meta property="og:title" content="AI 시대 미래역량 검사 — 3분 무료 탐색">
<meta property="og:description" content="AI가 대체할 수 없는 6가지 핵심 역량을 탐색하세요. 3분, 8문항, 무료.">
<meta property="og:type" content="website">
<!-- og:url과 og:image는 배포 URL 확정 후 추가. 비워두면 크롤러 오류 가능하므로 배포 전까지 주석 처리 -->
<!-- <meta property="og:url" content="[배포URL]"> -->
<!-- <meta property="og:image" content="[배포URL]/og-image.png"> -->
```

- [ ] **Step 4: 브라우저에서 확인**

파일을 브라우저에서 열어 변경된 텍스트 확인. 타이틀, hero 영역, 차원 소개 섹션의 "탐색" 텍스트 확인.

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "chore: update terminology 측정→탐색, year 2025→2026, add OG meta tags"
```

---

## Task 2: 10개 유형 분류 시스템 구현

기존 6개 ARCHETYPES를 10개 유형으로 확장하고, 점수 정규화 로직 + 분류 함수를 추가한다.

**Files:**
- Modify: `bts-assessment-site.html` — `<script>` 섹션

- [ ] **Step 1: ARCHETYPES 객체를 10개 유형으로 확장**

기존 ARCHETYPES (라인 436~443)를 삭제하고 아래로 교체:

```javascript
const ARCHETYPES = {
  allrounder:   {emoji:'🌟', title:'올라운더',       sub:'모든 역량이 고르게 높은 만능형 인재', key:'allrounder'},
  balanced:     {emoji:'🎯', title:'균형 전략가',    sub:'어떤 상황에서도 흔들리지 않는 안정형', key:'balanced'},
  explosive:    {emoji:'🌋', title:'잠재력 폭발형',  sub:'극단적 강점을 가진 돌파형 인재', key:'explosive'},
  dual_weapon:  {emoji:'⚔️', title:'이중 무기 보유자', sub:'두 가지 강점으로 시너지를 만드는 사람', key:'dual_weapon'},
  architect:    {emoji:'🏗️', title:'미래 설계자',    sub:'복잡함 속에서 질서를 찾는 사람', key:'architect'},
  disruptor:    {emoji:'🎨', title:'창조적 파괴자',   sub:'기존 틀을 깨고 새로운 길을 만드는 사람', key:'disruptor'},
  empath:       {emoji:'💛', title:'공감 리더',      sub:'사람의 마음을 읽고 연결하는 사람', key:'empath'},
  adapter:      {emoji:'⚡', title:'적응형 혁신가',   sub:'불확실성 속에서 기회를 잡는 사람', key:'adapter'},
  guardian:     {emoji:'⚖️', title:'윤리 수호자',    sub:'원칙과 가치로 판단하는 사람', key:'guardian'},
  synergist:    {emoji:'🤝', title:'시너지 메이커',   sub:'다양한 사람과 함께 더 큰 것을 만드는 사람', key:'synergist'}
};
```

- [ ] **Step 2: 한 줄 판결 데이터 추가**

ARCHETYPES 바로 아래에 추가:

```javascript
const TYPE_VERDICTS = {
  allrounder:  '당신은 올라운더형 인재입니다. 모든 역량이 고르게 높아 어떤 환경에서든 빠르게 적응할 수 있습니다.',
  balanced:    '당신은 균형 전략가입니다. 특정 역량에 치우치지 않는 안정감이 강점이며, 리더십 포지션에 적합합니다.',
  explosive:   '당신은 잠재력 폭발형입니다. 극단적 강점이 있지만, 약한 영역을 보완하면 무서운 성장이 가능합니다.',
  dual_weapon: '당신은 이중 무기 보유자입니다. 두 가지 핵심 역량의 조합이 독보적인 경쟁력을 만듭니다.',
  architect:   '당신은 미래 설계자입니다. 복잡한 문제를 구조화하는 능력이 AI 시대 핵심 경쟁력입니다.',
  disruptor:   '당신은 창조적 파괴자입니다. 기존 방식을 해체하고 재조립하는 능력은 AI가 대체하기 가장 어렵습니다.',
  empath:      '당신은 공감 리더입니다. 사람의 감정을 읽고 신뢰를 만드는 능력은 AI 시대 최고의 무기입니다.',
  adapter:     '당신은 적응형 혁신가입니다. 변화를 두려워하지 않고 빠르게 전환하는 능력이 강점입니다.',
  guardian:    '당신은 윤리 수호자입니다. AI 시대에 기술의 방향을 판단하는 역할이 점점 더 중요해집니다.',
  synergist:   '당신은 시너지 메이커입니다. 다양한 배경의 사람들과 협업해 더 큰 가치를 만드는 능력이 있습니다.'
};
```

- [ ] **Step 3: 점수 정규화 + 유형 분류 함수 추가**

기존 `finishAssessment()` 위에 추가:

```javascript
// 이론적 최대값 (buildScenarios 결과에 따라 조정 필요)
const THEORETICAL_MAX = {
  structural:12, creative:10, emotional:10,
  adaptive:10, ethical:9, collab:9
};

function normalizeScores(rawScores) {
  const normalized = {};
  for (const [k, v] of Object.entries(rawScores)) {
    normalized[k] = Math.min(100, Math.round(v / THEORETICAL_MAX[k] * 100));
  }
  return normalized;
}

function classifyType(normScores) {
  const vals = Object.values(normScores);
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const avg = Math.round(vals.reduce((a,b) => a+b, 0) / vals.length);
  const range = max - min;
  const sorted = Object.entries(normScores).sort((a,b) => b[1] - a[1]);
  const topKey = sorted[0][0];
  const top2diff = sorted[0][1] - sorted[1][1];

  if (avg >= 75 && min >= 60) return 'allrounder';
  if (range <= 10) return 'balanced';
  if (min <= 40 && max >= 90) return 'explosive';
  if (top2diff <= 5) return 'dual_weapon';

  const dimensionMap = {
    structural:'architect', creative:'disruptor', emotional:'empath',
    adaptive:'adapter', ethical:'guardian', collab:'synergist'
  };
  return dimensionMap[topKey] || 'balanced';
}
```

- [ ] **Step 4: 브라우저에서 확인**

이 단계에서는 데이터와 유틸리티 함수만 추가했다. 아직 호출하지 않으므로 콘솔 에러가 없는지만 확인.

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add 10-type classification data and utility functions"
```

> **중요**: 이 태스크에서는 finishAssessment()를 수정하지 않는다. finishAssessment() 수정은 Task 3에서 로딩 화면 추가와 함께 한 번에 처리한다 (리뷰 피드백: Task 2와 Task 3에서 같은 함수를 두 번 수정하면 코드가 유실될 수 있음).

---

## Task 3: 로딩 화면 + finishAssessment() 리팩토링

검사 완료 → 결과 사이에 2초 가짜 로딩 화면을 추가하고, finishAssessment()를 finishAssessment() + renderResult()로 분리한다. Task 2의 정규화/분류 로직도 여기서 통합한다.

**Files:**
- Modify: `bts-assessment-site.html` — HTML + CSS + JS

- [ ] **Step 1: CSS 추가**

`</style>` 바로 위에 추가:

```css
/* ===== LOADING SCREEN ===== */
.loading-center { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:40px 20px; text-align:center; }
.loading-emoji { font-size:48px; margin-bottom:16px; animation:loadingPulse 1.5s infinite; }
@keyframes loadingPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
.loading-title { font-size:20px; font-weight:700; color:var(--text); margin-bottom:24px; }
.loading-bar-wrap { width:200px; height:6px; background:#EDE9FE; border-radius:3px; overflow:hidden; margin-bottom:16px; }
.loading-bar-fill { height:100%; background:linear-gradient(90deg,var(--primary),var(--accent)); border-radius:3px; transition:width 0.3s; }
.loading-status { font-size:13px; color:var(--text-dim); min-height:20px; }
```

- [ ] **Step 2: HTML 추가**

`<!-- ===== SCREEN 4: RESULT + CHATBOT ===== -->` 바로 위에 추가:

```html
<!-- ===== SCREEN 3.5: LOADING ===== -->
<div class="screen" id="loadingScreen">
  <div class="loading-center">
    <div class="loading-emoji">🔬</div>
    <div class="loading-title">역량을 분석하고 있습니다</div>
    <div class="loading-bar-wrap"><div class="loading-bar-fill" id="loadingFill" style="width:0%"></div></div>
    <div class="loading-status" id="loadingStatus"></div>
  </div>
</div>
```

- [ ] **Step 3: JS — showLoading 함수 추가**

```javascript
function showLoading(callback) {
  showScreen('loadingScreen');
  const fill = document.getElementById('loadingFill');
  const status = document.getElementById('loadingStatus');
  const messages = ['6차원 역량 교차 분석 중...', '유형 패턴 매칭 중...', '맞춤 인사이트 생성 중...'];
  let progress = 0;
  let msgIdx = 0;
  status.textContent = messages[0];

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 95) progress = 95;
    fill.style.width = progress + '%';
    msgIdx++;
    if (msgIdx < messages.length) status.textContent = messages[msgIdx];
  }, 600);

  setTimeout(() => {
    clearInterval(interval);
    fill.style.width = '100%';
    status.textContent = '완료!';
    setTimeout(callback, 300);
  }, 2000);
}
```

- [ ] **Step 4: finishAssessment() + renderResult() 완전 교체**

기존 `finishAssessment()` 함수 전체 (라인 730~769)를 삭제하고, 아래 두 함수로 교체한다.
또한 기존 BTS CTA 이벤트 리스너 (라인 875~882)도 삭제한다 (Task 6에서 새로 구현).

```javascript
function finishAssessment(){
  clearInterval(timerInterval);
  showLoading(() => renderResult());
}

function renderResult(){
  // === 점수 정규화 + 유형 분류 (Task 2에서 정의한 함수 사용) ===
  const normScores = normalizeScores(scores);
  const typeKey = classifyType(normScores);
  const arch = ARCHETYPES[typeKey];
  const verdict = TYPE_VERDICTS[typeKey];
  const avgScore = Math.round(Object.values(normScores).reduce((a,b)=>a+b,0) / 6);
  const sorted = Object.entries(normScores).sort((a,b)=>b[1]-a[1]);
  const topKey = sorted[0][0];
  const avgTime = behaviorData.length > 0
    ? behaviorData.reduce((s,d)=>s+d.time,0)/behaviorData.length/1000 : 10;
  const qtypeMap = {scenario:'논리적 · 현실지향',game:'은유적 · 게임친화',
    image:'직관적 · 감각형',rank:'분석적 · 체계형'};

  // === competencyResult 저장 ===
  competencyResult = {
    rawScores: scores,
    scores: normScores,
    typeKey,
    topKey,
    archetype: arch.title,
    avgScore,
    verdict,
    avgTime,
    qtype: selectedQType,
    qtypeMeaning: qtypeMap[selectedQType]
  };

  // === 결과 화면 표시 ===
  showScreen('resultScreen');
  document.getElementById('resEmoji').textContent = arch.emoji;
  document.getElementById('resType').textContent = arch.title;
  document.getElementById('resSub').textContent = arch.sub;

  // 한 줄 판결
  document.getElementById('verdictText').textContent = verdict;

  // 6차원 바 차트
  const rowsEl = document.getElementById('scoreRows');
  rowsEl.innerHTML = '';
  sorted.forEach(([k,v],i)=>{
    const s = SKILLS_INFO[k];
    const pct = v;
    rowsEl.innerHTML += `<div class="score-row"><div class="score-icon">${s.icon}</div><div class="score-info"><div class="score-label"><span class="score-name">${s.name}</span><span class="score-val">${pct}%</span></div><div class="score-bar"><div class="score-fill" style="width:0%;background:${s.color}"></div></div></div></div>`;
  });
  setTimeout(()=>{
    document.querySelectorAll('.score-fill').forEach(el=>{
      el.style.width=el.parentElement.previousElementSibling.querySelector('.score-val').textContent;
    });
  },100);

  // 메타분석
  const fastRounds = behaviorData.filter(d=>d.time<5000).length;
  const style = fastRounds > behaviorData.length/2 ? '빠른 직관형 의사결정자' : '신중한 숙고형 의사결정자';
  document.getElementById('metaInsight').innerHTML =
    `선택한 검사 유형: <span class="insight-highlight">${qtypeMap[selectedQType]}</span><br>`+
    `→ 당신은 ${selectedQType==='scenario'?'현실의 맥락에서 논리적으로 판단하는':selectedQType==='game'?'게임적 사고로 전략을 세우는':selectedQType==='image'?'직관과 감각으로 빠르게 판단하는':'체계적으로 분석하고 정리하는'} 유형입니다.<br><br>`+
    `평균 응답시간: <span class="insight-highlight">${avgTime.toFixed(1)}초</span><br>`+
    `→ ${style}`;
}
```

> **체크포인트**: 이 함수가 기존 finishAssessment()의 모든 로직(점수 계산, 화면 표시, 바 차트, 메타분석)을 포함하고 있는지 확인. 챗봇 호출(`startChatbot()`)과 기존 BTS CTA 표시 코드는 의도적으로 제거됨.

- [ ] **Step 5: 브라우저에서 확인**

검사 완료 시:
- 로딩 화면이 2초간 표시되는지
- 진행 바가 0→100% 애니메이션 되는지
- 텍스트가 롤링되는지
- 2초 후 결과 화면으로 전환되는지

- [ ] **Step 6: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add loading screen between assessment and result"
```

---

## Task 4: 결과 화면 재구성 — 반원형 게이지 + 바 차트 개선

챗봇을 제거하고, 반원형 게이지 + 강화된 바 차트로 교체한다.

**Files:**
- Modify: `bts-assessment-site.html` — HTML + CSS + JS

- [ ] **Step 1: 반원형 게이지 CSS 추가**

```css
/* ===== GAUGE ===== */
.gauge-wrap { position:relative; width:200px; height:110px; margin:0 auto 8px; }
.gauge-svg { width:200px; height:110px; }
.gauge-bg { fill:none; stroke:#EDE9FE; stroke-width:12; stroke-linecap:round; }
.gauge-fill { fill:none; stroke:var(--primary); stroke-width:12; stroke-linecap:round; transition:stroke-dashoffset 1.5s ease-out; }
.gauge-score { position:absolute; bottom:8px; left:50%; transform:translateX(-50%); font-size:36px; font-weight:900; color:var(--text); }
.gauge-label { text-align:center; font-size:12px; color:var(--text-dim); margin-bottom:16px; }

/* ===== ENHANCED SCORES ===== */
.strength-badge { display:inline-block; background:var(--primary-light); color:var(--primary); font-size:11px; font-weight:600; padding:2px 8px; border-radius:6px; margin-left:8px; }
.growth-badge { display:inline-block; background:#FFF3CD; color:#856404; font-size:11px; font-weight:600; padding:2px 8px; border-radius:6px; margin-left:8px; }
```

- [ ] **Step 2: 결과 화면 HTML 재구성**

기존 `resultScreen` 내부를 전면 교체. 챗봇 관련 HTML (`chat-area`, `bts-cta`) 삭제하고 아래 구조로:

```html
<div class="screen" id="resultScreen">
  <!-- ① 종합 게이지 + 유형 -->
  <div class="result-hero">
    <div class="gauge-wrap">
      <svg class="gauge-svg" viewBox="0 0 200 110">
        <path class="gauge-bg" d="M 20 100 A 80 80 0 0 1 180 100"/>
        <path class="gauge-fill" id="gaugeFill" d="M 20 100 A 80 80 0 0 1 180 100"
              stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
      </svg>
      <div class="gauge-score" id="gaugeScore">0</div>
    </div>
    <div class="gauge-label">종합 미래역량 점수</div>
    <div class="result-emoji" id="resEmoji"></div>
    <div class="result-type" id="resType"></div>
    <div class="result-sub" id="resSub"></div>
  </div>

  <!-- ① 한 줄 판결 -->
  <div class="result-card">
    <div class="result-card-title">📋 한 줄 판결</div>
    <div id="verdictText" class="insight-text" style="font-weight:500; color:var(--text);"></div>
  </div>

  <!-- ② 6차원 바 차트 -->
  <div class="result-card">
    <div class="result-card-title">📊 6차원 역량 프로파일</div>
    <div id="scoreRows"></div>
  </div>

  <!-- ③ 메타분석 -->
  <div class="result-card">
    <div class="result-card-title">💡 사고방식 메타분석</div>
    <div id="metaInsight" class="insight-text"></div>
  </div>

  <!-- ④ 공유 (Task 5에서 구현) -->
  <div class="result-card" id="shareCard" style="display:none;"></div>

  <!-- ⑤ BTS CTA (Task 6에서 구현) -->
  <div class="bts-cta" id="btsCta" style="display:none;"></div>

  <!-- ⑥ 블러 미리보기 (Task 7에서 구현) -->
  <div class="result-card" id="blurCard" style="display:none;"></div>

  <!-- ⑦ 면책 조항 -->
  <footer>
    <p class="disclaimer" style="font-size:11px; color:var(--text-light); line-height:1.6; max-width:500px; margin:0 auto 12px; padding:0 20px;">
      본 검사는 자기인식 탐색 도구이며, 임상적 진단이나 채용 평가의 목적으로 사용될 수 없습니다.
      결과는 참고 자료이며, 전문적 진로 상담을 대체하지 않습니다.
      검증된 학술 프레임워크(Frey &amp; Osborne, O*NET, McKinsey, Autor, EU AI Act) 기반 설계.
    </p>
    <p style="font-size:12px; color:var(--text-light);">© 2026 LoginFuture Ministry. All rights reserved.</p>
    <p style="font-size:12px; color:var(--text-light); margin-top:4px;">AI 시대의 커리어 내비게이션 — <a href="https://job-future-analyzer.vercel.app" style="color:var(--primary); text-decoration:none; font-weight:600;">BTS(Build Tomorrow Skills)</a></p>
  </footer>
</div>
```

- [ ] **Step 3: JS — 게이지 애니메이션 함수 추가**

```javascript
function animateGauge(score) {
  const fill = document.getElementById('gaugeFill');
  const scoreEl = document.getElementById('gaugeScore');
  const totalLength = 251.2; // 반원 둘레
  const targetOffset = totalLength * (1 - score / 100);

  // 카운트업 애니메이션
  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    current = Math.round(score * eased);
    scoreEl.textContent = current;
    fill.style.strokeDashoffset = totalLength * (1 - (score * eased) / 100);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
```

- [ ] **Step 4: renderResult()에서 게이지 + 강화된 바 차트 렌더링**

`renderResult()` 함수 내, 결과 표시 부분을 수정:

```javascript
// 게이지
animateGauge(competencyResult.avgScore);

// 유형
document.getElementById('resEmoji').textContent = arch.emoji;
document.getElementById('resType').textContent = arch.title;
document.getElementById('resSub').textContent = arch.sub;

// 한 줄 판결
document.getElementById('verdictText').textContent = verdict;

// 6차원 바 차트 (강점/성장 배지 포함)
const rowsEl = document.getElementById('scoreRows');
rowsEl.innerHTML = '';
const sortedScores = Object.entries(normScores).sort((a,b) => b[1] - a[1]);
sortedScores.forEach(([k, v], i) => {
  const s = SKILLS_INFO[k];
  const badge = i < 2 ? '<span class="strength-badge">강점</span>'
    : (i === sortedScores.length - 1 ? '<span class="growth-badge">성장 포인트</span>' : '');
  rowsEl.innerHTML += `<div class="score-row">
    <div class="score-icon">${s.icon}</div>
    <div class="score-info">
      <div class="score-label"><span class="score-name">${s.name}${badge}</span><span class="score-val">${v}%</span></div>
      <div class="score-bar"><div class="score-fill" style="width:0%;background:${s.color}"></div></div>
    </div>
  </div>`;
});

// 바 차트 순차 애니메이션 (0.2초 stagger)
setTimeout(() => {
  document.querySelectorAll('.score-fill').forEach((el, i) => {
    setTimeout(() => {
      el.style.width = el.closest('.score-row').querySelector('.score-val').textContent;
    }, i * 200);
  });
}, 300);
```

- [ ] **Step 5: 챗봇 관련 JS 코드 삭제**

기존 코드에서 삭제:
- `chatArea`, `chatStep` 변수
- `addBotMsg()`, `addUserMsg()`, `addOptions()`, `startChatbot()` 함수 전체
- `startChatbot()` 호출부

- [ ] **Step 6: 브라우저에서 확인**

- 반원형 게이지가 0→최종값 애니메이션 되는지
- 유형명과 한 줄 판결이 표시되는지
- 바 차트가 순차적으로 등장하는지
- 강점 Top 2 / 성장 포인트 배지가 표시되는지
- 면책 조항이 하단에 표시되는지
- 콘솔 에러 없는지

- [ ] **Step 7: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: redesign result screen with gauge, enhanced bar chart, remove chatbot"
```

---

## Task 5: 공유 기능 (링크 복사 + X)

결과 화면에 공유 버튼 영역을 추가한다.

> **의존성 주의**: 이 태스크에서 정의하는 `showToast()` 함수는 Task 7 (이메일 수집)에서도 사용된다. Task 5는 반드시 Task 7보다 먼저 구현해야 한다.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + HTML + JS

- [ ] **Step 1: 공유 버튼 CSS 추가**

```css
/* ===== SHARE ===== */
.share-wrap { display:flex; gap:10px; justify-content:center; }
.share-btn { display:flex; align-items:center; gap:6px; padding:12px 20px; border-radius:12px; border:1.5px solid var(--border); background:var(--surface); font-size:13px; font-weight:600; color:var(--text); transition:all 0.2s; touch-action:manipulation; }
.share-btn:active { transform:scale(0.97); }
.share-btn.copied { border-color:var(--accent); background:rgba(78,205,196,0.08); color:var(--accent); }
.share-toast { position:fixed; bottom:40px; left:50%; transform:translateX(-50%) translateY(20px); background:rgba(30,27,75,0.9); color:#fff; padding:12px 24px; border-radius:12px; font-size:13px; font-weight:600; z-index:100; opacity:0; transition:all 0.3s; pointer-events:none; }
.share-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }
```

- [ ] **Step 2: 공유 카드 HTML**

`shareCard` div 내용을 설정하는 대신, renderResult()에서 동적으로 생성:

```javascript
// renderResult() 내 — 공유 영역
const shareCard = document.getElementById('shareCard');
shareCard.style.display = 'block';
shareCard.innerHTML = `
  <div class="result-card-title">📤 결과 공유하기</div>
  <div class="share-wrap">
    <button class="share-btn" id="copyLinkBtn">📋 링크 복사</button>
    <button class="share-btn" id="shareXBtn">𝕏 공유</button>
  </div>
`;
```

- [ ] **Step 3: 토스트 HTML 추가**

`</body>` 바로 위에:
```html
<div class="share-toast" id="shareToast"></div>
```

- [ ] **Step 4: 공유 JS 로직**

```javascript
function showToast(text) {
  const toast = document.getElementById('shareToast');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function getShareText() {
  const r = competencyResult;
  const arch = ARCHETYPES[r.typeKey];
  return `AI 시대 미래역량 검사 결과: 나는 ${arch.emoji}${arch.title}! 종합 점수 ${r.avgScore}점.\n당신의 미래 역량은?\n→ ${location.href}`;
}

function setupShareButtons() {
  document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    const text = getShareText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // HTTPS 미지원 환경 폴백
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    document.getElementById('copyLinkBtn').classList.add('copied');
    document.getElementById('copyLinkBtn').textContent = '✅ 복사됨!';
    showToast('결과가 클립보드에 복사되었습니다!');
    setTimeout(() => {
      document.getElementById('copyLinkBtn').classList.remove('copied');
      document.getElementById('copyLinkBtn').innerHTML = '📋 링크 복사';
    }, 2000);
  });

  document.getElementById('shareXBtn').addEventListener('click', () => {
    const text = getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  });
}
```

renderResult() 마지막에 `setupShareButtons();` 호출 추가.

- [ ] **Step 5: 브라우저에서 확인**

- 링크 복사 버튼 클릭 시 토스트 표시 + 버튼 텍스트 변경
- X 공유 버튼 클릭 시 트윗 창 열림
- 공유 텍스트에 유형명, 점수, URL 포함 확인

- [ ] **Step 6: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add share buttons (copy link + X/Twitter)"
```

---

## Task 6: BTS 연결 CTA (Base64 토큰)

결과에서 BTS 본앱으로 이동하는 CTA 버튼을 Base64 토큰과 함께 구현한다.

**Files:**
- Modify: `bts-assessment-site.html` — JS

- [ ] **Step 1: BTS CTA HTML + 토큰 생성**

renderResult() 내에서 btsCta 영역 렌더링:

```javascript
// BTS CTA
const btsCta = document.getElementById('btsCta');
btsCta.style.display = 'block';
btsCta.innerHTML = `
  <h3>🔮 내 직업의 AI 대체율도 분석하기</h3>
  <p>당신의 역량을 특정 직업과 교차 분석하면<br>더 구체적인 전환 전략이 나옵니다</p>
  <button class="bts-btn" id="btsCTABtn">BTS에서 심층 분석 받기 →</button>
  <div class="bts-features">
    <span class="bts-feat">AI 대체율 분석</span>
    <span class="bts-feat">10년 예측</span>
    <span class="bts-feat">전환 경로</span>
    <span class="bts-feat">스킬 로드맵</span>
  </div>
`;

// Base64 토큰 생성
const KEY_MAP = {structural:'st',creative:'cr',emotional:'ec',adaptive:'aa',ethical:'ej',collab:'ci'};
const shortScores = {};
for (const [k,v] of Object.entries(competencyResult.scores)) {
  shortScores[KEY_MAP[k]] = v;
}
const token = btoa(JSON.stringify({
  s: shortScores,
  type: competencyResult.typeKey,
  t: Date.now()
}));
const btsUrl = `https://job-future-analyzer.vercel.app?competency=${token}`;

document.getElementById('btsCTABtn').addEventListener('click', () => {
  window.open(btsUrl, '_blank');
});
```

- [ ] **Step 2: 브라우저에서 확인**

- BTS CTA 카드가 표시되는지
- 버튼 클릭 시 BTS 본앱이 새 탭에서 열리는지
- URL에 `?competency=` 파라미터가 포함되는지
- 개발자 도구에서 `atob()` 로 토큰 디코딩해 점수/유형 확인

- [ ] **Step 3: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add BTS CTA with Base64 competency token"
```

---

## Task 7: 결정 리포트 블러 미리보기 + 이메일 수집

결정 리포트 블러 카드와 이메일 수집 폼을 추가한다.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 블러 + 이메일 폼 CSS 추가**

```css
/* ===== BLUR PREVIEW ===== */
.blur-preview { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:12px; filter:blur(6px); user-select:none; pointer-events:none; }
.blur-preview p { font-size:13px; line-height:1.8; color:var(--text-dim); }
.email-form { display:flex; flex-direction:column; gap:10px; margin-top:16px; }
.email-input { width:100%; padding:12px 16px; border:1.5px solid var(--border); border-radius:12px; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s; }
.email-input:focus { border-color:var(--primary); }
.consent-row { display:flex; align-items:flex-start; gap:8px; }
.consent-row input[type="checkbox"] { margin-top:3px; accent-color:var(--primary); }
.consent-row label { font-size:12px; color:var(--text-dim); line-height:1.5; }
.email-submit { width:100%; padding:14px; border-radius:12px; background:linear-gradient(135deg,var(--primary),#8B5CF6); color:#fff; font-size:14px; font-weight:600; border:none; transition:opacity 0.2s; }
.email-submit:disabled { opacity:0.4; cursor:not-allowed; }
.email-note { font-size:11px; color:var(--text-light); text-align:center; margin-top:4px; }
```

- [ ] **Step 2: 블러 카드 + 이메일 폼 렌더링**

renderResult() 내:

```javascript
// 블러 미리보기 + 이메일
const GOOGLE_FORM_URL = ''; // Google Form 생성 후 URL 입력
const GOOGLE_FORM_EMAIL_FIELD = 'entry.0000000'; // 실제 entry ID로 교체
const GOOGLE_FORM_TYPE_FIELD = 'entry.0000001';  // 실제 entry ID로 교체

const blurCard = document.getElementById('blurCard');
blurCard.style.display = 'block';
blurCard.innerHTML = `
  <div class="result-card-title">🔒 결정 리포트 미리보기</div>
  <div class="blur-preview">
    <p>📌 전환 경로 Top 3<br>1. 데이터 분석 전문가 (적합도 92%)<br>2. UX 리서처 (적합도 87%)<br>3. AI 트레이너 (적합도 83%)</p>
    <p>📋 90일 실행 계획<br>1~30일: 기초 역량 강화 프로그램<br>31~60일: 실전 프로젝트 참여<br>61~90일: 포트폴리오 완성 + 네트워킹</p>
  </div>
  <div style="text-align:center; margin-bottom:12px;">
    <span style="font-size:14px; font-weight:600; color:var(--text);">📩 출시되면 알려드릴게요</span>
  </div>
  <div class="email-form">
    <input type="email" class="email-input" id="emailInput" placeholder="이메일을 입력하세요">
    <div class="consent-row">
      <input type="checkbox" id="consentCheck">
      <label for="consentCheck">마케팅 정보 수신에 동의합니다</label>
    </div>
    <button class="email-submit" id="emailSubmitBtn" disabled>알림 신청하기</button>
    <div class="email-note">※ 이메일은 출시 알림 목적으로만 사용되며, 언제든 해지 가능합니다</div>
  </div>
`;

// 동의 체크 시 버튼 활성화
document.getElementById('consentCheck').addEventListener('change', (e) => {
  document.getElementById('emailSubmitBtn').disabled = !e.target.checked;
});

// 이메일 제출
document.getElementById('emailSubmitBtn').addEventListener('click', () => {
  const email = document.getElementById('emailInput').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('올바른 이메일을 입력해주세요');
    return;
  }

  if (GOOGLE_FORM_URL) {
    // Google Forms 숨김 제출
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'emailFrame';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_FORM_URL;
    form.target = 'emailFrame';

    const emailField = document.createElement('input');
    emailField.name = GOOGLE_FORM_EMAIL_FIELD;
    emailField.value = email;
    form.appendChild(emailField);

    const typeField = document.createElement('input');
    typeField.name = GOOGLE_FORM_TYPE_FIELD;
    typeField.value = competencyResult.archetype;
    form.appendChild(typeField);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    setTimeout(() => document.body.removeChild(iframe), 3000);
  }

  // UI 피드백
  document.getElementById('emailSubmitBtn').textContent = '✅ 신청 완료!';
  document.getElementById('emailSubmitBtn').disabled = true;
  document.getElementById('emailInput').disabled = true;
  document.getElementById('consentCheck').disabled = true;
  showToast('신청 완료! 출시되면 알려드릴게요 📩');
});
```

- [ ] **Step 3: 브라우저에서 확인**

- 블러 처리된 미리보기 카드가 표시되는지
- 이메일 입력 + 동의 체크 없이 버튼 비활성화인지
- 동의 체크 시 버튼 활성화되는지
- 제출 시 "신청 완료!" 로 변경되는지
- Google Form URL 미설정 시에도 UI 피드백은 정상 동작하는지

- [ ] **Step 4: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add blurred report preview with email collection form"
```

---

## Task 8: UX 폴리시 — 문항 전환 애니메이션 + 타이머 완화

문항 전환 시 fade 애니메이션 추가, 타이머 경고 톤 완화.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 문항 전환 애니메이션 CSS**

```css
/* ===== QUESTION TRANSITION ===== */
.assess-body { transition:opacity 0.3s ease; }
.assess-body.fade-out { opacity:0; }
```

주의: `.assess-body.fade-in` 클래스는 불필요. `fade-out` 제거 시 기본 `opacity:1`로 돌아감.

- [ ] **Step 2: loadRound()에서 fade 적용**

기존 `loadRound()` 시작 부분에 fade-out 추가. **중요**: 타이머 시작(`clearInterval`, `setInterval`)은 fade가 끝난 후 실행해야 사용자가 300ms를 손해보지 않는다.

```javascript
function loadRound(){
  if(round >= scenarios.length){ finishAssessment(); return; }

  const body = document.getElementById('assessBody');
  body.classList.add('fade-out');

  setTimeout(() => {
    // === 여기서부터 기존 loadRound 코드 (타이머 셋업 포함) ===
    const s = scenarios[round];
    const total = scenarios.length;
    document.getElementById('roundLabel').textContent = `${round+1}/${total}`;
    document.getElementById('progressFill').style.width = `${(round+1)/total*100}%`;
    timeLeft = 30;
    roundStartTime = Date.now();
    // ... 타이머 setInterval, 문항 렌더링 등 기존 코드 전부 ...
    // === 기존 코드 끝 ===

    body.classList.remove('fade-out');
  }, 300);
}
```

- [ ] **Step 3: 타이머 경고 완화**

기존: 10초 이하 시 `.warning` (코랄 색상)
변경: 5초 이하 시에만 `.warning`, 색상도 약한 톤으로

```javascript
// 기존: if(timeLeft <= 10) timerEl.classList.add('warning');
// 변경:
if(timeLeft <= 5) timerEl.classList.add('warning');
```

CSS 수정:
```css
.assess-timer.warning { color: #F59E0B; } /* 코랄 → 약한 오렌지 */
```

- [ ] **Step 4: 브라우저에서 확인**

- 문항 전환 시 fade 애니메이션이 동작하는지
- 타이머가 5초 이하에서만 색상 변경되는지

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add question fade transition, soften timer warning"
```

---

## Task 9: 최종 점검 + 모바일 테스트

전체 플로우를 처음부터 끝까지 점검한다.

**Files:**
- Modify: `bts-assessment-site.html` (필요 시 버그 수정)

- [ ] **Step 1: 전체 플로우 테스트**

랜딩 → 검사 방식 선택 → 8문항 완료 → 로딩 → 결과 화면 전체를 통과한다.

체크리스트:
- [ ] 랜딩 페이지: "탐색" 용어, CTA 버튼 작동
- [ ] 검사 방식 선택: 4개 카드 모두 작동
- [ ] 검사 진행: 8문항, 타이머, 진행 바, fade 전환
- [ ] 로딩 화면: 2초, 텍스트 롤링, 진행 바
- [ ] 결과 — 게이지: 0→최종값 카운트업
- [ ] 결과 — 유형명: 10개 중 하나
- [ ] 결과 — 한 줄 판결: 유형에 맞는 텍스트
- [ ] 결과 — 바 차트: 순차 등장, 강점/성장 배지
- [ ] 결과 — 메타분석: 검사 유형, 응답시간
- [ ] 결과 — 공유: 링크 복사 + X 작동
- [ ] 결과 — BTS CTA: 새 탭 열림, URL에 토큰 포함
- [ ] 결과 — 블러 미리보기: 블러 적용, 이메일 폼 작동
- [ ] 결과 — 면책 조항: 하단 표시
- [ ] 콘솔 에러 없음

- [ ] **Step 2: 모바일 시뮬레이션**

브라우저 개발자 도구에서 모바일 뷰(375px 너비)로 확인:
- [ ] 터치 버튼 최소 44px
- [ ] 게이지/차트 모바일에서 깨지지 않음
- [ ] 드래그 순위형 문항 터치 작동
- [ ] 스크롤 자연스러움

- [ ] **Step 3: 발견된 버그 수정**

- [ ] **Step 4: 최종 커밋**

```bash
git add bts-assessment-site.html
git commit -m "fix: final QA fixes and polish"
```

---

## Summary

| Task | 내용 | 예상 시간 |
|------|------|-----------|
| 1 | 용어 수정 + 메타태그 | 5분 |
| 2 | 10개 유형 분류 시스템 | 15분 |
| 3 | 로딩 화면 | 10분 |
| 4 | 결과 화면 재구성 (게이지+바차트) | 20분 |
| 5 | 공유 기능 | 10분 |
| 6 | BTS 연결 CTA | 10분 |
| 7 | 블러 미리보기 + 이메일 | 15분 |
| 8 | UX 폴리시 | 10분 |
| 9 | 최종 점검 | 15분 |
| **합계** | | **~110분** |
