# 검사 재미 강화 + 가족 모드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 검사를 게임처럼 재미있게 만들고, 개인/가족 모드를 선택할 수 있게 한다.

**Architecture:** 기존 `bts-assessment-site.html` 단일 파일 유지. 스크린 시스템에 모드 선택(modeScreen) + 이름 입력(nameScreen) + 가족 비교 결과(familyResultScreen) 3개 화면 추가. 가족 모드는 브라우저 메모리에서 처리 (서버 없음). 재미 요소는 CSS 애니메이션 + JS로 구현.

**Tech Stack:** HTML/CSS/JS (순수), CSS keyframe animations, SVG

**기존 파일:** `bts-assessment-site.html` (1,140줄)

**기존 스크린 흐름:**
landing → qtypeScreen → assessScreen → loadingScreen → resultScreen

**새 스크린 흐름:**
landing → **modeScreen** → **nameScreen** → qtypeScreen → assessScreen → loadingScreen → resultScreen → (가족이면 **familyResultScreen**)

---

## File Structure

단일 파일 수정. 모든 변경은 `bts-assessment-site.html` 내에서 이루어진다.

| 파일 | 작업 |
|------|------|
| `bts-assessment-site.html` | 수정 (1,140줄 → ~2,400줄) |

---

## Task 1: 재미 요소 — 파티클 + 콤보 시스템

선택 시 이모지 파티클이 터지고, 빠른 연속 답변에 "콤보" 표시.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 파티클 CSS 추가**

`</style>` 바로 위에:

```css
/* ===== PARTICLES ===== */
.particle-container { position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:200; overflow:hidden; }
.particle { position:absolute; font-size:24px; animation:particleFly 1s ease-out forwards; pointer-events:none; }
@keyframes particleFly {
  0% { opacity:1; transform:translateY(0) scale(1); }
  100% { opacity:0; transform:translateY(-120px) scale(0.3); }
}

/* ===== COMBO ===== */
.combo-badge { position:fixed; top:80px; right:20px; background:linear-gradient(135deg,#FF6B6B,#FF8E53); color:#fff; padding:8px 16px; border-radius:12px; font-size:14px; font-weight:800; z-index:50; opacity:0; transform:scale(0.5); transition:all 0.3s; pointer-events:none; }
.combo-badge.show { opacity:1; transform:scale(1); }
.combo-badge.show { animation:comboPop 0.4s ease; }
@keyframes comboPop { 0%{transform:scale(0.5)} 50%{transform:scale(1.2)} 100%{transform:scale(1)} }
```

- [ ] **Step 2: 파티클 HTML + 콤보 배지 HTML**

`</body>` 바로 위, `shareToast` div 옆에:

```html
<div class="particle-container" id="particleContainer"></div>
<div class="combo-badge" id="comboBadge"></div>
```

- [ ] **Step 3: 파티클 JS + 콤보 로직**

기존 state 변수 영역(`let competencyResult = null;` 뒤)에 추가:

```javascript
let comboCount = 0;
let lastAnswerTime = 0;

function spawnParticles(x, y) {
  const container = document.getElementById('particleContainer');
  const emojis = ['✨','🌟','💫','⚡','🔥','💥','🎯','🚀'];
  for (let i = 0; i < 6; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = (x + (Math.random() - 0.5) * 80) + 'px';
    p.style.top = y + 'px';
    p.style.animationDuration = (0.6 + Math.random() * 0.6) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 1200);
  }
}

function checkCombo() {
  const now = Date.now();
  if (now - lastAnswerTime < 4000 && lastAnswerTime > 0) {
    comboCount++;
    if (comboCount >= 2) {
      const badge = document.getElementById('comboBadge');
      badge.textContent = `🔥 ${comboCount}콤보!`;
      badge.classList.remove('show');
      void badge.offsetWidth; // reflow
      badge.classList.add('show');
      setTimeout(() => badge.classList.remove('show'), 1500);
    }
  } else {
    comboCount = 1;
  }
  lastAnswerTime = now;
}
```

- [ ] **Step 4: selectChoice()에 파티클 + 콤보 연동**

`selectChoice` 함수에서 기존 `showFeedback(fb);` 줄 바로 위에 추가:

```javascript
  // 파티클 + 콤보
  const choiceEl = document.querySelector('.assess-choice.selected, .assess-image-card.selected');
  if (choiceEl) {
    const rect = choiceEl.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top);
  }
  checkCombo();
```

`submitRank` 함수에서도 `showFeedback` 줄 위에:

```javascript
  spawnParticles(window.innerWidth / 2, 400);
  checkCombo();
```

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add particle effects and combo system for fun"
```

---

## Task 2: 재미 요소 — 캐릭터 가이드 "비티" + 선택 피드백 강화

AI 캐릭터 비티(BT)가 문항마다 코멘트하고, 피드백을 더 크고 극적으로 만든다.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 캐릭터 + 강화된 피드백 CSS**

```css
/* ===== CHARACTER GUIDE ===== */
.bt-guide { display:flex; align-items:flex-start; gap:10px; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 16px; margin:0 20px 16px; max-width:500px; margin-left:auto; margin-right:auto; animation:slideUp 0.4s ease; }
.bt-avatar { font-size:28px; flex-shrink:0; }
.bt-msg { font-size:13px; color:var(--text-dim); line-height:1.6; }
.bt-msg strong { color:var(--text); }
@keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* ===== ENHANCED FEEDBACK ===== */
.feedback { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(30,27,75,0.95); color:#fff; padding:20px 32px; border-radius:18px; font-size:17px; font-weight:700; z-index:100; pointer-events:none; opacity:0; transition:opacity 0.3s; text-align:center; max-width:280px; }
.feedback .fb-sub { font-size:12px; font-weight:400; opacity:0.7; margin-top:4px; }
```

참고: `.feedback` CSS는 기존 것(line ~131)을 **교체**한다.

- [ ] **Step 2: 캐릭터 코멘트 데이터**

기존 JS에 추가 (ARCHETYPES 아래):

```javascript
const BT_COMMENTS = {
  // 문항 번호별 코멘트 (8문항)
  0: {msg:'첫 번째 질문! 직감대로 골라보세요 🎯', emoji:'🤖'},
  1: {msg:'흠, 흥미로운 선택이었어요. 다음은...', emoji:'🤔'},
  2: {msg:'슬슬 패턴이 보이기 시작하네요!', emoji:'👀'},
  3: {msg:'벌써 절반! 당신의 강점이 드러나고 있어요 💪', emoji:'🔥'},
  4: {msg:'후반전 시작! 여기서 반전이 올 수도...', emoji:'⚡'},
  5: {msg:'오, 이건 좀 어려운 질문이에요', emoji:'😮'},
  6: {msg:'거의 다 왔어요! 마지막 힘내세요', emoji:'🏃'},
  7: {msg:'마지막 질문! 이게 결과를 바꿀 수도 있어요', emoji:'🎲'}
};

// 선택 피드백 서브텍스트
const FB_SUBS = [
  '이 선택이 당신을 정의합니다',
  '흥미로운 관점이네요',
  'AI는 이렇게 생각하지 못해요',
  '당신만의 강점이 보여요',
  '이 역량이 미래를 바꿉니다',
  '독특한 시각이에요',
  '이런 사람이 필요합니다',
  '바로 이게 핵심이에요'
];
```

- [ ] **Step 3: loadRound()에 캐릭터 가이드 삽입**

`loadRound()` 함수에서 문항 렌더링 후 (body.classList.remove('fade-out') 바로 위), 캐릭터를 추가:

```javascript
    // 캐릭터 가이드
    const comment = BT_COMMENTS[round] || BT_COMMENTS[0];
    const guide = document.createElement('div');
    guide.className = 'bt-guide';
    guide.innerHTML = `<div class="bt-avatar">${comment.emoji}</div><div class="bt-msg">${comment.msg}</div>`;
    body.insertBefore(guide, body.firstChild);
```

- [ ] **Step 4: showFeedback() 강화**

기존 `showFeedback` 함수를 교체:

```javascript
function showFeedback(text){
  const el = document.getElementById('feedback');
  const sub = FB_SUBS[Math.floor(Math.random() * FB_SUBS.length)];
  el.innerHTML = `${text}<div class="fb-sub">${sub}</div>`;
  el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1000);
}
```

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add BT character guide and enhanced feedback"
```

---

## Task 3: 재미 요소 — 중간 인터미션 (4문항 후)

4문항 완료 후 "전반전 분석" 화면을 잠깐 보여준다.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 인터미션 CSS**

```css
/* ===== INTERMISSION ===== */
.intermission { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; padding:40px 20px; }
.inter-emoji { font-size:48px; margin-bottom:12px; animation:loadingPulse 1.5s infinite; }
.inter-title { font-size:22px; font-weight:800; color:var(--text); margin-bottom:8px; }
.inter-sub { font-size:14px; color:var(--text-dim); margin-bottom:20px; line-height:1.6; }
.inter-peek { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:16px 24px; display:inline-flex; align-items:center; gap:10px; font-size:15px; font-weight:600; color:var(--primary); animation:slideUp 0.5s ease 0.3s both; }
```

- [ ] **Step 2: loadRound()에 인터미션 삽입**

`loadRound()` 함수 최상단, `if(round >= scenarios.length)` 체크 바로 아래에:

```javascript
  // 중간 인터미션 (4문항 후)
  if (round === 4 && !window._intermissionShown) {
    window._intermissionShown = true;
    const body = document.getElementById('assessBody');
    body.classList.remove('fade-out');
    body.innerHTML = '';
    
    // 중간 점수 계산
    const midNorm = normalizeScores(scores);
    const midSorted = Object.entries(midNorm).sort((a,b) => b[1] - a[1]);
    const topSkill = SKILLS_INFO[midSorted[0][0]];
    
    body.innerHTML = `<div class="intermission">
      <div class="inter-emoji">📊</div>
      <div class="inter-title">전반전 분석 완료!</div>
      <div class="inter-sub">4문항 동안 당신의 선택을 분석했어요.<br>현재 가장 강한 역량은...</div>
      <div class="inter-peek">${topSkill.icon} ${topSkill.name}</div>
      <div class="inter-sub" style="margin-top:16px; font-size:13px;">후반전에서 뒤집힐 수 있을까요? 🤔</div>
    </div>`;
    
    setTimeout(() => {
      loadRound(); // 인터미션 후 실제 4번째 문항 로드
    }, 2500);
    return;
  }
```

- [ ] **Step 3: startAssessment()에서 인터미션 플래그 초기화**

`startAssessment()` 함수에 `window._intermissionShown = false;` 추가 (round = 0 줄 아래):

```javascript
  window._intermissionShown = false;
  comboCount = 0;
  lastAnswerTime = 0;
```

- [ ] **Step 4: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add halftime intermission after question 4"
```

---

## Task 4: 재미 요소 — 드라마틱 결과 공개 연출

결과를 한 번에 보여주지 않고 단계별로 드라마틱하게 공개.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: 결과 공개 연출 CSS**

```css
/* ===== DRAMATIC REVEAL ===== */
.reveal-stage { opacity:0; transform:translateY(20px); transition:all 0.6s ease; }
.reveal-stage.visible { opacity:1; transform:translateY(0); }
.result-hero .result-emoji { font-size:64px; animation:revealBounce 0.8s ease 0.2s both; }
@keyframes revealBounce { 0%{opacity:0;transform:scale(0)} 60%{transform:scale(1.3)} 100%{opacity:1;transform:scale(1)} }
.result-hero .result-type { animation:revealBounce 0.8s ease 0.5s both; }
.gauge-wrap { animation:revealBounce 0.8s ease 0s both; }
```

- [ ] **Step 2: renderResult()에 순차 공개 로직**

`renderResult()` 함수에서 `showScreen('resultScreen');` 바로 아래에, 기존 렌더링 전에:

```javascript
  // 결과 카드들을 순차 공개
  const revealCards = document.querySelectorAll('#resultScreen .result-card, #resultScreen .bts-cta, #resultScreen footer');
  revealCards.forEach(card => card.classList.add('reveal-stage'));
  
  // 시차 공개 (게이지 → 0.5초 후 카드들 순차)
  setTimeout(() => {
    revealCards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), i * 400);
    });
  }, 800);
```

- [ ] **Step 3: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add dramatic sequential result reveal animation"
```

---

## Task 5: 재미 요소 — 진행 중 배경색 변화

문항이 진행될수록 배경색이 점진적으로 변해서 에너지 상승 느낌.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + JS

- [ ] **Step 1: CSS 변수 transition**

기존 `body` CSS rule에 transition 추가. 기존:
```css
body { font-family:'Noto Sans KR',sans-serif; background:var(--bg); color:var(--text); -webkit-tap-highlight-color:transparent; }
```
교체:
```css
body { font-family:'Noto Sans KR',sans-serif; background:var(--bg); color:var(--text); -webkit-tap-highlight-color:transparent; transition:background 0.8s ease; }
```

- [ ] **Step 2: loadRound()에 배경색 변화**

`loadRound()` setTimeout 콜백 내, `body.classList.remove('fade-out');` 바로 아래:

```javascript
    // 진행 배경색 변화
    const bgColors = ['#F8F7FF','#F5F3FF','#F0ECFF','#EBE5FF','#E6DEFF','#E0D6FF','#DBD0FF','#D5C9FF'];
    document.body.style.background = bgColors[Math.min(round, bgColors.length - 1)];
```

- [ ] **Step 3: finishAssessment()에서 배경 초기화**

`showLoading` 콜백에서 `showScreen('resultScreen');` 전에:
```javascript
  document.body.style.background = '';
```

추가 위치: `renderResult()` 함수 최상단에도:
```javascript
  document.body.style.background = '';
```

- [ ] **Step 4: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add progressive background color change during assessment"
```

---

## Task 6: 모드 선택 화면 + 이름 입력 화면

개인/가족 모드를 선택하고 이름을 입력하는 새 화면 2개 추가.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + HTML + JS

- [ ] **Step 1: 모드 선택 + 이름 입력 CSS**

```css
/* ===== MODE SELECT ===== */
.mode-cards { display:flex; flex-direction:column; gap:16px; max-width:420px; margin:0 auto; padding:0 20px; }
.mode-card { background:var(--surface); border:2px solid var(--border); border-radius:20px; padding:24px; text-align:center; transition:all 0.2s; cursor:pointer; touch-action:manipulation; }
.mode-card:active { transform:scale(0.97); }
.mode-card.selected { border-color:var(--primary); background:var(--primary-light); }
.mode-emoji { font-size:40px; margin-bottom:8px; }
.mode-title { font-size:18px; font-weight:800; margin-bottom:4px; }
.mode-desc { font-size:13px; color:var(--text-dim); line-height:1.5; }
.mode-badge { display:inline-block; font-size:11px; font-weight:600; padding:3px 10px; border-radius:8px; margin-top:8px; }

/* ===== NAME INPUT ===== */
.name-screen-inner { max-width:420px; margin:0 auto; padding:60px 20px; text-align:center; }
.name-input { width:100%; padding:16px 20px; border:2px solid var(--border); border-radius:16px; font-size:18px; font-weight:600; font-family:inherit; text-align:center; outline:none; transition:border-color 0.2s; background:var(--surface); }
.name-input:focus { border-color:var(--primary); }
.name-input::placeholder { color:var(--text-light); font-weight:400; }
.name-submit { width:100%; padding:16px; border-radius:14px; background:linear-gradient(135deg,var(--primary),#8B5CF6); color:#fff; font-size:16px; font-weight:700; border:none; margin-top:16px; transition:opacity 0.2s; cursor:pointer; }
.name-submit:disabled { opacity:0.3; cursor:not-allowed; }
.family-count { display:flex; gap:10px; justify-content:center; margin-top:20px; }
.family-count-btn { width:44px; height:44px; border-radius:12px; border:2px solid var(--border); background:var(--surface); font-size:18px; font-weight:700; cursor:pointer; transition:all 0.2s; }
.family-count-btn.selected { border-color:var(--primary); background:var(--primary-light); color:var(--primary); }
```

- [ ] **Step 2: 모드 선택 화면 HTML**

`qtypeScreen` div 바로 위에 삽입:

```html
<!-- ===== SCREEN: MODE SELECT ===== -->
<div class="screen" id="modeScreen">
  <div style="text-align:center; padding:60px 20px 30px;">
    <div style="font-size:40px; margin-bottom:8px;">🎮</div>
    <div class="section-title" style="font-size:24px;">어떻게 검사할까요?</div>
    <div class="section-desc" style="font-size:14px;">혼자 해도, 가족과 함께 해도 재미있어요!</div>
  </div>
  <div class="mode-cards">
    <div class="mode-card" id="modePersonal">
      <div class="mode-emoji">🧑</div>
      <div class="mode-title">개인 검사</div>
      <div class="mode-desc">나만의 미래 역량을 탐색합니다</div>
      <div class="mode-badge" style="background:var(--primary-light); color:var(--primary);">3분 · 8문항</div>
    </div>
    <div class="mode-card" id="modeFamily">
      <div class="mode-emoji">👨‍👩‍👧‍👦</div>
      <div class="mode-title">가족 검사</div>
      <div class="mode-desc">가족이 순서대로 같은 검사를 하고<br>결과를 비교합니다</div>
      <div class="mode-badge" style="background:rgba(78,205,196,0.15); color:#0D9488;">2~4명 · 각 3분</div>
    </div>
  </div>
</div>

<!-- ===== SCREEN: NAME INPUT ===== -->
<div class="screen" id="nameScreen">
  <div class="name-screen-inner">
    <div style="font-size:40px; margin-bottom:12px;" id="nameEmoji">🧑</div>
    <div class="section-title" style="font-size:22px;" id="nameTitle">이름을 알려주세요</div>
    <div class="section-desc" style="font-size:13px; margin-bottom:24px;" id="nameDesc">결과에 이름이 표시됩니다</div>
    <input class="name-input" id="playerNameInput" placeholder="이름 입력" maxlength="10" autocomplete="off">
    <div id="familyCountSection" style="display:none;">
      <div style="font-size:13px; color:var(--text-dim); margin-top:20px; margin-bottom:8px;">가족 몇 명이 참여하나요?</div>
      <div class="family-count" id="familyCountBtns"></div>
    </div>
    <button class="name-submit" id="nameSubmitBtn" disabled>시작하기 →</button>
  </div>
</div>
```

- [ ] **Step 3: 모드 + 이름 입력 JS**

State 영역에 추가:

```javascript
let gameMode = 'personal'; // 'personal' | 'family'
let familySize = 2;
let familyMembers = []; // [{name, scores, normScores, typeKey, avgScore, ...}]
let currentFamilyIdx = 0;
let playerName = '';
```

이벤트 리스너 추가 (기존 LANDING EVENTS 영역 아래):

```javascript
// ===== MODE SCREEN =====
document.getElementById('modePersonal').addEventListener('click', () => {
  gameMode = 'personal';
  familyMembers = [];
  currentFamilyIdx = 0;
  document.getElementById('nameEmoji').textContent = '🧑';
  document.getElementById('nameTitle').textContent = '이름을 알려주세요';
  document.getElementById('nameDesc').textContent = '결과에 이름이 표시됩니다';
  document.getElementById('familyCountSection').style.display = 'none';
  document.getElementById('playerNameInput').value = '';
  document.getElementById('nameSubmitBtn').disabled = true;
  showScreen('nameScreen');
  document.getElementById('playerNameInput').focus();
});

document.getElementById('modeFamily').addEventListener('click', () => {
  gameMode = 'family';
  familyMembers = [];
  currentFamilyIdx = 0;
  document.getElementById('nameEmoji').textContent = '👨‍👩‍👧‍👦';
  document.getElementById('nameTitle').textContent = '가족 검사 설정';
  document.getElementById('nameDesc').textContent = '첫 번째 가족 구성원의 이름을 입력하세요';
  document.getElementById('familyCountSection').style.display = 'block';
  document.getElementById('playerNameInput').value = '';
  document.getElementById('playerNameInput').placeholder = '첫 번째 가족 이름';
  document.getElementById('nameSubmitBtn').disabled = true;
  
  // 가족 수 버튼 생성
  const countContainer = document.getElementById('familyCountBtns');
  countContainer.innerHTML = '';
  [2,3,4].forEach(n => {
    const btn = document.createElement('button');
    btn.className = 'family-count-btn' + (n === 2 ? ' selected' : '');
    btn.textContent = n;
    btn.addEventListener('click', () => {
      familySize = n;
      countContainer.querySelectorAll('.family-count-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    countContainer.appendChild(btn);
  });
  
  showScreen('nameScreen');
  document.getElementById('playerNameInput').focus();
});

// 이름 입력 활성화
document.getElementById('playerNameInput').addEventListener('input', (e) => {
  document.getElementById('nameSubmitBtn').disabled = e.target.value.trim().length === 0;
});
document.getElementById('playerNameInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.value.trim().length > 0) {
    document.getElementById('nameSubmitBtn').click();
  }
});

// 이름 확인 → 다음 화면
document.getElementById('nameSubmitBtn').addEventListener('click', () => {
  playerName = document.getElementById('playerNameInput').value.trim();
  if (!playerName) return;
  showScreen('qtypeScreen');
});
```

- [ ] **Step 4: 랜딩 CTA가 modeScreen으로 이동하도록 변경**

기존 이벤트 리스너 변경:

```javascript
// 기존: showScreen('qtypeScreen') → 변경: showScreen('modeScreen')
document.getElementById('heroStartBtn').addEventListener('click',()=>showScreen('modeScreen'));
document.getElementById('heroStartBtn').addEventListener('touchend',e=>{e.preventDefault();showScreen('modeScreen')});
document.getElementById('ctaStartBtn').addEventListener('click',()=>showScreen('modeScreen'));
document.getElementById('ctaStartBtn').addEventListener('touchend',e=>{e.preventDefault();showScreen('modeScreen')});
```

- [ ] **Step 5: renderResult()에서 이름 표시**

결과 화면 유형명 표시 부분에서, `document.getElementById('resSub').textContent = arch.sub;` 아래에:

```javascript
  // 이름 표시
  if (playerName) {
    document.getElementById('resType').textContent = `${playerName}님은 ${arch.title}`;
  }
```

- [ ] **Step 6: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add mode selection and name input screens"
```

---

## Task 7: 가족 모드 — 순차 검사 + 비교 결과

가족 모드에서 여러 명이 순서대로 검사하고, 마지막에 비교 결과를 보여준다.

**Files:**
- Modify: `bts-assessment-site.html` — CSS + HTML + JS

- [ ] **Step 1: 가족 결과 비교 CSS**

```css
/* ===== FAMILY RESULT ===== */
.family-result-hero { text-align:center; padding:40px 20px 20px; }
.family-member-tabs { display:flex; gap:8px; justify-content:center; margin-bottom:20px; flex-wrap:wrap; }
.family-tab { padding:8px 16px; border-radius:10px; border:1.5px solid var(--border); background:var(--surface); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
.family-tab.active { border-color:var(--primary); background:var(--primary-light); color:var(--primary); }
.family-compare-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.family-compare-name { width:60px; font-size:11px; font-weight:600; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.family-compare-bar-wrap { flex:1; height:8px; background:#EDE9FE; border-radius:4px; overflow:hidden; }
.family-compare-bar { height:100%; border-radius:4px; transition:width 1s ease; }
.family-compare-val { width:36px; font-size:11px; font-weight:700; color:var(--primary); }
.family-talk-card { background:linear-gradient(135deg,#FFF7ED,#FEF3C7); border:1px solid #FDE68A; border-radius:16px; padding:20px; margin:0 20px 16px; max-width:500px; margin-left:auto; margin-right:auto; }
.family-talk-card h4 { font-size:14px; font-weight:700; margin-bottom:10px; }
.family-talk-item { font-size:13px; color:var(--text-dim); line-height:1.6; margin-bottom:8px; padding-left:16px; position:relative; }
.family-talk-item::before { content:'💬'; position:absolute; left:0; }
.family-type-card { display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:14px 16px; margin-bottom:8px; }
.family-type-emoji { font-size:28px; }
.family-type-info { flex:1; }
.family-type-name { font-size:14px; font-weight:700; }
.family-type-label { font-size:11px; color:var(--text-dim); }
```

- [ ] **Step 2: 가족 결과 화면 HTML**

`resultScreen` div 바로 아래에:

```html
<!-- ===== SCREEN: FAMILY RESULT ===== -->
<div class="screen" id="familyResultScreen">
  <div class="family-result-hero">
    <div style="font-size:48px; margin-bottom:8px;">👨‍👩‍👧‍👦</div>
    <div class="section-title" style="font-size:22px;">우리 가족 역량 비교</div>
    <div class="section-desc" style="font-size:13px;" id="familySummary"></div>
  </div>

  <!-- 가족 유형 카드 -->
  <div class="result-card" id="familyTypeCards">
    <div class="result-card-title">👥 가족 구성원 유형</div>
    <div id="familyTypeList"></div>
  </div>

  <!-- 6차원 비교 차트 -->
  <div class="result-card" id="familyCompareCard">
    <div class="result-card-title">📊 역량 비교</div>
    <div id="familyCompareChart"></div>
  </div>

  <!-- 가족 대화 주제 -->
  <div class="family-talk-card" id="familyTalkCard">
    <h4>🗣️ 가족 대화 주제</h4>
    <div id="familyTalkList"></div>
  </div>

  <!-- 공유 + BTS CTA는 기존 것 재활용 -->
  <div class="result-card" id="familyShareCard" style="display:none;"></div>
  <div class="bts-cta" id="familyBtsCta" style="display:none;"></div>

  <footer>
    <p class="disclaimer" style="font-size:11px; color:var(--text-light); line-height:1.6; max-width:500px; margin:0 auto 12px; padding:0 20px;">
      본 검사는 자기인식 탐색 도구이며, 임상적 진단이나 채용 평가의 목적으로 사용될 수 없습니다.
      결과는 참고 자료이며, 전문적 진로 상담을 대체하지 않습니다.
    </p>
    <p style="font-size:12px; color:var(--text-light);">© 2026 LoginFuture Ministry. All rights reserved.</p>
  </footer>
</div>
```

- [ ] **Step 3: 가족 모드 핵심 로직**

가족 모드에서는 검사 완료 후 다음 가족 구성원에게 넘기거나, 마지막이면 비교 결과를 보여준다.

`renderResult()` 함수 최하단, `setupShareButtons();` 호출 아래에 추가:

```javascript
  // 가족 모드: 현재 구성원 결과 저장 + 다음 사람 or 비교 결과
  if (gameMode === 'family') {
    familyMembers.push({
      name: playerName,
      scores: {...scores},
      normScores: {...normScores},
      typeKey,
      archetype: arch.title,
      archetypeEmoji: arch.emoji,
      avgScore
    });
    
    currentFamilyIdx++;
    
    if (currentFamilyIdx < familySize) {
      // 다음 가족 구성원
      const nextBtn = document.createElement('button');
      nextBtn.className = 'name-submit';
      nextBtn.style.cssText = 'max-width:500px; margin:20px auto; display:block;';
      nextBtn.textContent = `다음 가족 (${currentFamilyIdx + 1}/${familySize}) →`;
      nextBtn.addEventListener('click', () => {
        document.getElementById('nameEmoji').textContent = ['🧑','👧','👦','👴','👵'][currentFamilyIdx] || '🧑';
        document.getElementById('nameTitle').textContent = `${currentFamilyIdx + 1}번째 가족`;
        document.getElementById('nameDesc').textContent = '이름을 입력하고 같은 검사를 진행합니다';
        document.getElementById('playerNameInput').value = '';
        document.getElementById('playerNameInput').placeholder = `${currentFamilyIdx + 1}번째 가족 이름`;
        document.getElementById('nameSubmitBtn').disabled = true;
        document.getElementById('familyCountSection').style.display = 'none';
        showScreen('nameScreen');
        document.getElementById('playerNameInput').focus();
      });
      // BTS CTA 아래, 블러 카드 위에 삽입
      const blurCard = document.getElementById('blurCard');
      blurCard.parentNode.insertBefore(nextBtn, blurCard);
      
      // 가족 모드에서는 블러/이메일 숨기기 (마지막에만 표시)
      blurCard.style.display = 'none';
    } else {
      // 모든 가족 완료 → 비교 결과
      setTimeout(() => renderFamilyResult(), 500);
    }
  }
```

- [ ] **Step 4: renderFamilyResult() 함수**

`renderResult()` 함수 아래에 새 함수:

```javascript
function renderFamilyResult() {
  showScreen('familyResultScreen');
  
  // 요약
  document.getElementById('familySummary').textContent = 
    `${familyMembers.map(m=>m.name).join(', ')} — ${familyMembers.length}명의 가족 역량을 비교합니다`;
  
  // 유형 카드
  const typeList = document.getElementById('familyTypeList');
  typeList.innerHTML = '';
  familyMembers.forEach(m => {
    typeList.innerHTML += `<div class="family-type-card">
      <div class="family-type-emoji">${m.archetypeEmoji}</div>
      <div class="family-type-info">
        <div class="family-type-name">${m.name}</div>
        <div class="family-type-label">${m.archetype} · 종합 ${m.avgScore}점</div>
      </div>
    </div>`;
  });
  
  // 6차원 비교 차트
  const chart = document.getElementById('familyCompareChart');
  chart.innerHTML = '';
  const dimKeys = ['structural','creative','emotional','adaptive','ethical','collab'];
  const colors = ['#6C63FF','#FF6B6B','#4ECDC4','#FFE66D','#A78BFA','#34D399'];
  
  dimKeys.forEach(dk => {
    const skill = SKILLS_INFO[dk];
    chart.innerHTML += `<div style="margin-bottom:14px;">
      <div style="font-size:12px; font-weight:600; margin-bottom:6px;">${skill.icon} ${skill.name}</div>
      ${familyMembers.map((m, i) => `<div class="family-compare-row">
        <div class="family-compare-name">${m.name}</div>
        <div class="family-compare-bar-wrap">
          <div class="family-compare-bar" style="width:0%;background:${colors[i % colors.length]}" data-target="${m.normScores[dk]}"></div>
        </div>
        <div class="family-compare-val">${m.normScores[dk]}%</div>
      </div>`).join('')}
    </div>`;
  });
  
  // 바 애니메이션
  setTimeout(() => {
    chart.querySelectorAll('.family-compare-bar').forEach(bar => {
      bar.style.width = bar.dataset.target + '%';
    });
  }, 300);
  
  // 가족 대화 주제 생성
  const talkList = document.getElementById('familyTalkList');
  talkList.innerHTML = '';
  
  // 가장 큰 차이가 나는 차원 찾기
  let maxDiff = 0, maxDiffDim = 'structural';
  dimKeys.forEach(dk => {
    const vals = familyMembers.map(m => m.normScores[dk]);
    const diff = Math.max(...vals) - Math.min(...vals);
    if (diff > maxDiff) { maxDiff = diff; maxDiffDim = dk; }
  });
  
  const diffSkill = SKILLS_INFO[maxDiffDim];
  const highest = familyMembers.reduce((a,b) => a.normScores[maxDiffDim] > b.normScores[maxDiffDim] ? a : b);
  const lowest = familyMembers.reduce((a,b) => a.normScores[maxDiffDim] < b.normScores[maxDiffDim] ? a : b);
  
  talkList.innerHTML += `<div class="family-talk-item">"${diffSkill.name}"에서 ${highest.name}(${highest.normScores[maxDiffDim]}%)과 ${lowest.name}(${lowest.normScores[maxDiffDim]}%)의 차이가 가장 커요. 서로의 관점을 이야기해 보세요.</div>`;
  
  // 유형이 다른 경우
  const types = [...new Set(familyMembers.map(m=>m.typeKey))];
  if (types.length > 1) {
    talkList.innerHTML += `<div class="family-talk-item">가족 안에 ${types.length}가지 다른 유형이 있어요! 다양성이 가족의 힘입니다.</div>`;
  } else {
    talkList.innerHTML += `<div class="family-talk-item">가족 모두 같은 유형(${familyMembers[0].archetype})이에요! 비슷한 강점을 가진 가족이네요.</div>`;
  }
  
  talkList.innerHTML += `<div class="family-talk-item">"AI 시대에 우리 가족이 가장 잘 할 수 있는 일은 뭘까?" 함께 이야기해 보세요.</div>`;
  
  // 공유 버튼
  const shareCard = document.getElementById('familyShareCard');
  shareCard.style.display = 'block';
  shareCard.innerHTML = `
    <div class="result-card-title">📤 가족 결과 공유하기</div>
    <div class="share-wrap">
      <button class="share-btn" id="familyCopyBtn">📋 링크 복사</button>
      <button class="share-btn" id="familyShareXBtn">𝕏 공유</button>
    </div>
  `;
  
  document.getElementById('familyCopyBtn').addEventListener('click', async () => {
    const text = `우리 가족 미래역량 검사 결과!\n${familyMembers.map(m=>`${m.name}: ${m.archetypeEmoji}${m.archetype} (${m.avgScore}점)`).join('\n')}\n→ ${location.href}`;
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea'); ta.value = text;
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    showToast('가족 결과가 복사되었습니다!');
  });
  
  document.getElementById('familyShareXBtn').addEventListener('click', () => {
    const text = `우리 가족 미래역량 검사 결과! ${familyMembers.map(m=>`${m.name}=${m.archetypeEmoji}`).join(' ')}\n→ ${location.href}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
  });
  
  // BTS CTA
  const btsCta = document.getElementById('familyBtsCta');
  btsCta.style.display = 'block';
  btsCta.innerHTML = `
    <h3>🔮 가족의 직업 미래도 분석하기</h3>
    <p>각자의 역량을 직업과 교차 분석하면<br>더 구체적인 전환 전략이 나옵니다</p>
    <button class="bts-btn" onclick="window.open('https://job-future-analyzer.vercel.app','_blank')">BTS에서 심층 분석 받기 →</button>
  `;
}
```

- [ ] **Step 5: 커밋**

```bash
git add bts-assessment-site.html
git commit -m "feat: add family mode with sequential assessment and comparison results"
```

---

## Task 8: 재배포 + 최종 확인

변경된 파일을 Vercel에 재배포하고 전체 플로우를 확인한다.

**Files:**
- Copy: `bts-assessment-site.html` → `../bts-assessment-deploy/index.html`

- [ ] **Step 1: 배포**

```bash
cp bts-assessment-site.html ../bts-assessment-deploy/index.html
cd ../bts-assessment-deploy
npx vercel --prod --yes
```

- [ ] **Step 2: 전체 플로우 확인**

체크리스트:
- [ ] 랜딩 → 모드 선택 (개인/가족 카드)
- [ ] 개인: 이름 입력 → 검사 → 파티클 + 콤보 → 인터미션 → 결과
- [ ] 가족: 이름 + 인원수 → 1번째 검사 → 결과 → "다음 가족" → 2번째 검사 → 비교 결과
- [ ] 파티클 터지는지
- [ ] 콤보 배지 나오는지
- [ ] 캐릭터 비티 코멘트 보이는지
- [ ] 4문항 후 인터미션
- [ ] 결과 순차 공개 애니메이션
- [ ] 배경색 변화
- [ ] 가족 비교 차트
- [ ] 가족 대화 주제
- [ ] 콘솔 에러 없음

- [ ] **Step 3: 최종 커밋**

```bash
git add bts-assessment-site.html
git commit -m "chore: final polish for fun + family mode"
```

---

## Summary

| Task | 내용 | 예상 시간 |
|------|------|-----------|
| 1 | 파티클 + 콤보 시스템 | 10분 |
| 2 | 캐릭터 비티 + 피드백 강화 | 10분 |
| 3 | 중간 인터미션 | 8분 |
| 4 | 드라마틱 결과 공개 | 8분 |
| 5 | 배경색 변화 | 5분 |
| 6 | 모드 선택 + 이름 입력 | 15분 |
| 7 | 가족 모드 순차 + 비교 결과 | 20분 |
| 8 | 재배포 + 최종 확인 | 10분 |
| **합계** | | **~86분** |
