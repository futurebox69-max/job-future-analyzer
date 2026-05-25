"use client";

/**
 * 미래 경고등 300 프로젝트 / Future Warning Light 300 Project
 *
 * Lightweight bilingual landing page for interest registration.
 * Self-contained — no shared component imports beyond the layout.
 *
 * Backend integration: see TODO marker in `submitInterest()` below.
 * Once Supabase / API route / Tally / Google Form is decided,
 * replace the local-only handler with the real submission call.
 */

import { useEffect, useMemo, useState } from "react";

// =====================================================================
// COPY — bilingual. Edit text here.
// =====================================================================

type Lang = "ko" | "en";

const COPY = {
  ko: {
    brand: "FUTURE BOX",
    langToggle: { ko: "한국어", en: "English" },
    hero: {
      title: "미래 경고등 300 프로젝트",
      subtitle: "인공지능 시대, 내 일과 내 삶은 어디서 멈추고 있는가",
      message:
        "당신의 미래가 망했다는 뜻이 아닙니다.\n다만 지금 켜진 경고등을 무시하면, 같은 문제가 반복될 수 있습니다.",
      cta: "관심 등록하기",
    },
    explanation: {
      label: "PROJECT",
      title: "이 프로젝트가 무엇인가",
      body: "FUTURE BOX는 300명을 대상으로 개인 맞춤 미래준비 구조 해석 리포트를 준비하고 있습니다. 이 리포트는 당신을 평가하는 검사가 아닙니다. 변화 앞에서 자주 멈추는 지점, 반복되는 병목, 아직 보지 못한 강점, 오늘 시작할 수 있는 작은 행동을 함께 보여주는 미래 점검 리포트입니다.",
    },
    audience: {
      label: "WHO IT'S FOR",
      title: "이런 분께",
      items: [
        "인공지능 때문에 내 일이 어떻게 바뀔지 불안한 분",
        "열심히 살고 있지만 미래 준비는 계속 미뤄지는 분",
        "자료는 많이 보는데 실제 행동으로 잘 이어지지 않는 분",
        "자영업이나 프리랜서로 일하며 다음 방향을 고민하는 분",
        "자녀의 미래 준비를 돕고 싶은 부모",
      ],
    },
    report: {
      label: "REPORT",
      title: "리포트에 담길 것",
      items: [
        "내 미래 멈춤지점",
        "내 반복 패턴",
        "내 일과 경험의 위험 신호",
        "내가 아직 보지 못한 강점",
        "오늘 시작할 10분 행동",
        "공유 가능한 결과 카드",
      ],
    },
    note: {
      label: "NOTE",
      body: "이 프로젝트는 정식 심리검사나 의학적 진단이 아닙니다. 빠르게 변하는 시대 속에서 자신의 행동 패턴을 돌아보고 다음 행동을 설계하기 위한 구조 해석 리포트입니다.",
    },
    form: {
      label: "INTEREST",
      title: "관심 등록",
      sub: "프로젝트가 열릴 때 가장 먼저 안내드립니다.",
      fields: {
        name: { label: "이름 또는 닉네임", placeholder: "예: 손준희" },
        email: { label: "이메일", placeholder: "example@email.com" },
        currentStatus: { label: "현재 상태" },
        futureConcern: { label: "가장 큰 미래 고민" },
        reportTrack: { label: "리포트 트랙" },
        question: {
          label: "리포트에서 답을 듣고 싶은 한 가지 질문 (선택)",
          placeholder: "예: 지금 일을 5년 더 해도 괜찮을지 알고 싶습니다.",
        },
        reportLang: { label: "리포트 언어" },
      },
      placeholderSelect: "선택해 주세요",
      submit: "관심 등록 제출하기",
      submitting: "전송 중…",
    },
    success: {
      title: "관심 등록이 완료되었습니다.",
      body: "프로젝트가 열릴 때 가장 먼저 안내드리겠습니다.",
      back: "처음으로",
    },
    footer: "© FUTURE BOX · 미래 경고등 300 프로젝트",
  },
  en: {
    brand: "FUTURE BOX",
    langToggle: { ko: "한국어", en: "English" },
    hero: {
      title: "Future Warning Light 300 Project",
      subtitle: "Where do your work and life tend to stop in the age of AI?",
      message:
        "This does not mean your future is broken.\nIt means there may be a warning light you should not ignore.",
      cta: "Join the interest list",
    },
    explanation: {
      label: "PROJECT",
      title: "What this is",
      body: "FUTURE BOX is preparing a personal future-readiness structure report for the first 300 participants. This is not a personality test. It is a reflection report designed to help you see where you tend to stop when facing change, what repeated bottleneck may be holding you back, what hidden strength you may already have, and what small action you can take today.",
    },
    audience: {
      label: "WHO IT'S FOR",
      title: "Who this is for",
      items: [
        "worried about how AI may change your work",
        "working hard but still postponing future preparation",
        "collecting information but not turning it into action",
        "running a small business or freelance career",
        "helping your child prepare for the future",
      ],
    },
    report: {
      label: "REPORT",
      title: "What the report may include",
      items: [
        "your future stopping point",
        "your repeated preparation pattern",
        "risk signals in your work or life",
        "hidden strengths you may not be seeing",
        "one 10-minute action to begin with",
        "a shareable result card",
      ],
    },
    note: {
      label: "NOTE",
      body: "This project is not a formal psychological or medical diagnosis. It is a structure-based reflection report designed to help you understand your behavior pattern and design your next action in a changing world.",
    },
    form: {
      label: "INTEREST",
      title: "Register your interest",
      sub: "You will be the first to hear when the project opens.",
      fields: {
        name: { label: "Name or nickname", placeholder: "e.g. Paul" },
        email: { label: "Email", placeholder: "example@email.com" },
        currentStatus: { label: "Current status" },
        futureConcern: { label: "Biggest future concern" },
        reportTrack: { label: "Report track" },
        question: {
          label: "One question you want the report to answer (optional)",
          placeholder:
            "e.g. I want to know whether my current role still makes sense five years out.",
        },
        reportLang: { label: "Preferred report language" },
      },
      placeholderSelect: "Please select",
      submit: "Submit interest",
      submitting: "Submitting…",
    },
    success: {
      title: "Your interest has been registered.",
      body: "You will be notified when the project opens.",
      back: "Back to top",
    },
    footer: "© FUTURE BOX · Future Warning Light 300",
  },
} as const;

// =====================================================================
// OPTIONS — bilingual labels share the same `value` for backend stability.
// =====================================================================

const STATUS_OPTIONS: { value: string; ko: string; en: string }[] = [
  { value: "worker", ko: "직장인", en: "Worker" },
  { value: "small_business", ko: "자영업자 · 소상공인", en: "Small business owner" },
  { value: "freelancer", ko: "프리랜서", en: "Freelancer" },
  { value: "career_transition", ko: "경력 전환 준비 중", en: "Career transition" },
  { value: "student_young", ko: "학생 · 사회초년생", en: "Student / young professional" },
  { value: "parent", ko: "부모", en: "Parent" },
  { value: "other", ko: "기타", en: "Other" },
];

const CONCERN_OPTIONS: { value: string; ko: string; en: string }[] = [
  { value: "ai_change_work", ko: "인공지능 때문에 내 일이 어떻게 바뀔지 불안하다", en: "AI may change my work" },
  { value: "stability", ko: "지금 일이 안정적으로 유지될지 확신할 수 없다", en: "I do not know if my current work will remain stable" },
  { value: "where_to_start", ko: "준비가 필요하다는 건 알지만 어디서 시작해야 할지 모른다", en: "I know I need to prepare but do not know where to start" },
  { value: "info_no_action", ko: "자료는 많이 보는데 행동으로 이어지지 않는다", en: "I collect information but do not take action" },
  { value: "help_child", ko: "자녀의 미래 준비를 돕고 싶다", en: "I want to help my child prepare for the future" },
  { value: "other", ko: "기타", en: "Other" },
];

const TRACK_OPTIONS: { value: string; ko: string; en: string }[] = [
  { value: "worker_business_transition", ko: "직장인 · 자영업 · 경력 전환", en: "Worker / small business / career transition" },
  { value: "student_young", ko: "학생 · 사회초년생", en: "Student / young professional" },
  { value: "parent", ko: "부모", en: "Parent" },
  { value: "not_sure", ko: "아직 모르겠다", en: "Not sure" },
];

const REPORT_LANG_OPTIONS: { value: "ko" | "en" | "both"; ko: string; en: string }[] = [
  { value: "ko", ko: "한국어", en: "Korean" },
  { value: "en", ko: "English", en: "English" },
  { value: "both", ko: "한국어 + English", en: "Both" },
];

// =====================================================================
// STATE TYPES
// =====================================================================

interface InterestForm {
  name: string;
  email: string;
  currentStatus: string;
  futureConcern: string;
  reportTrack: string;
  question: string;
  reportLang: "" | "ko" | "en" | "both";
}

const initialForm: InterestForm = {
  name: "",
  email: "",
  currentStatus: "",
  futureConcern: "",
  reportTrack: "",
  question: "",
  reportLang: "",
};

// =====================================================================
// SUBMIT — placeholder until backend wiring (Supabase / API route / Tally / Google Form)
// =====================================================================

async function submitInterest(payload: InterestForm & { lang: Lang; submittedAt: string }) {
  // TODO(backend): replace this local-only handler with a real submission.
  //   Options to wire later:
  //     1. POST to a Next.js route handler (e.g. /api/interest/future-warning-light-300)
  //     2. Supabase table insert (e.g. table `interest_warning_light_300`)
  //     3. Google Form or Tally webhook
  //   Keep the payload shape stable so backend swap is one-line.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.info("[interest-form/future-warning-light-300]", payload);
    try {
      const key = "fwl300_interest_local";
      const prev = JSON.parse(window.localStorage.getItem(key) || "[]");
      window.localStorage.setItem(key, JSON.stringify([...prev, payload]));
    } catch {
      /* localStorage unavailable — ignore */
    }
  }
  return { ok: true };
}

// =====================================================================
// PAGE
// =====================================================================

export default function FutureWarningLight300Page() {
  const [lang, setLang] = useState<Lang>("ko");
  const [form, setForm] = useState<InterestForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const t = COPY[lang];

  // Required fields for enabling submit
  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
      form.currentStatus !== "" &&
      form.futureConcern !== "" &&
      form.reportTrack !== "" &&
      form.reportLang !== ""
    );
  }, [form]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title =
        lang === "ko"
          ? "미래 경고등 300 프로젝트 · FUTURE BOX"
          : "Future Warning Light 300 · FUTURE BOX";
    }
  }, [lang]);

  function update<K extends keyof InterestForm>(k: K, v: InterestForm[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await submitInterest({
        ...form,
        lang,
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
      // Smooth scroll up to success view
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToForm() {
    const el = typeof document !== "undefined" ? document.getElementById("interest-form") : null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ===== Render: Success view =====
  if (submitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-md w-full animate-fade-in">
          <div className="label-mono text-[11px] text-[#C9A24B] mb-6">FUTURE BOX</div>
          <h1
            className="text-2xl md:text-3xl font-bold leading-snug mb-4"
            style={{ fontFamily: "var(--font-gowun-batang), 'Noto Serif KR', serif" }}
          >
            {t.success.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-[rgba(242,235,220,0.7)] mb-8">
            {t.success.body}
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setForm(initialForm);
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(201,162,75,0.45)] px-6 py-3 text-sm font-semibold text-[#F2EBDC] hover:bg-[rgba(201,162,75,0.1)] transition-colors"
          >
            {t.success.back}
          </button>
        </div>
      </main>
    );
  }

  // ===== Render: Main landing =====
  return (
    <main className="min-h-screen text-[#F2EBDC]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 md:px-8 py-5 max-w-3xl mx-auto">
        <div className="label-mono text-[11px] text-[#C9A24B]">{t.brand}</div>
        <div
          className="inline-flex items-center rounded-full border border-[rgba(201,162,75,0.3)] p-[3px] text-[12px]"
          role="group"
          aria-label="Language toggle"
        >
          <button
            type="button"
            onClick={() => setLang("ko")}
            className={`px-3 py-1 rounded-full transition-colors ${
              lang === "ko"
                ? "bg-[#C9A24B] text-[#0B1B2B] font-semibold"
                : "text-[rgba(242,235,220,0.7)] hover:text-[#F2EBDC]"
            }`}
            aria-pressed={lang === "ko"}
          >
            {t.langToggle.ko}
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full transition-colors ${
              lang === "en"
                ? "bg-[#C9A24B] text-[#0B1B2B] font-semibold"
                : "text-[rgba(242,235,220,0.7)] hover:text-[#F2EBDC]"
            }`}
            aria-pressed={lang === "en"}
          >
            {t.langToggle.en}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-5 md:px-8 pt-8 md:pt-16 pb-16 md:pb-24 max-w-3xl mx-auto">
        <h1
          className="text-[34px] md:text-[44px] font-bold leading-[1.18] tracking-tight mb-4"
          style={{ fontFamily: "var(--font-gowun-batang), 'Noto Serif KR', serif" }}
        >
          {t.hero.title}
        </h1>
        <p className="text-[16px] md:text-[18px] text-[rgba(242,235,220,0.75)] leading-relaxed mb-8">
          {t.hero.subtitle}
        </p>

        <div className="rounded-2xl border border-[rgba(201,162,75,0.18)] bg-[#0F2438]/60 backdrop-blur-sm p-6 md:p-8 mb-10">
          <p className="text-[15px] md:text-[17px] leading-[1.85] whitespace-pre-line">
            {t.hero.message}
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToForm}
          className="w-full md:w-auto inline-flex items-center justify-center rounded-full bg-[#C9A24B] text-[#0B1B2B] px-8 py-4 text-[15px] font-semibold tracking-tight hover:bg-[#D8B260] transition-colors shadow-[0_8px_24px_rgba(201,162,75,0.18)]"
        >
          {t.hero.cta}
          <span aria-hidden="true" className="ml-2">→</span>
        </button>
      </section>

      {/* Explanation */}
      <Section labelMono={t.explanation.label} title={t.explanation.title}>
        <p className="text-[15px] md:text-[16px] leading-[1.85] text-[rgba(242,235,220,0.8)]">
          {t.explanation.body}
        </p>
      </Section>

      {/* Audience */}
      <Section labelMono={t.audience.label} title={t.audience.title}>
        <ul className="space-y-3">
          {t.audience.items.map((line, i) => (
            <li key={i} className="flex gap-3 items-start text-[15px] md:text-[16px] leading-[1.7]">
              <span className="mt-[10px] inline-block w-1.5 h-1.5 rounded-full bg-[#C9A24B] flex-shrink-0" aria-hidden="true" />
              <span className="text-[rgba(242,235,220,0.85)]">{line}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Report contents */}
      <Section labelMono={t.report.label} title={t.report.title}>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {t.report.items.map((line, i) => (
            <li
              key={i}
              className="rounded-xl border border-[rgba(201,162,75,0.18)] bg-[#0F2438]/40 px-4 py-3 text-[14px] md:text-[15px] text-[rgba(242,235,220,0.9)]"
            >
              {line}
            </li>
          ))}
        </ul>
      </Section>

      {/* Note */}
      <section className="px-5 md:px-8 pb-12 max-w-3xl mx-auto">
        <div className="rounded-xl border border-[rgba(201,162,75,0.14)] bg-[rgba(201,162,75,0.04)] px-5 py-4">
          <div className="label-mono text-[10px] text-[#C9A24B] mb-2">{t.note.label}</div>
          <p className="text-[13px] md:text-[14px] leading-[1.75] text-[rgba(242,235,220,0.7)]">
            {t.note.body}
          </p>
        </div>
      </section>

      {/* Interest form */}
      <section id="interest-form" className="px-5 md:px-8 pb-24 max-w-3xl mx-auto scroll-mt-8">
        <div className="label-mono text-[11px] text-[#C9A24B] mb-3">{t.form.label}</div>
        <h2
          className="text-[24px] md:text-[28px] font-bold leading-tight mb-2"
          style={{ fontFamily: "var(--font-gowun-batang), 'Noto Serif KR', serif" }}
        >
          {t.form.title}
        </h2>
        <p className="text-[14px] text-[rgba(242,235,220,0.6)] mb-8">{t.form.sub}</p>

        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-[rgba(201,162,75,0.18)] bg-[#0F2438]/60 p-5 md:p-7"
          noValidate
        >
          {/* Name */}
          <Field label={t.form.fields.name.label} htmlFor="fwl-name" required>
            <input
              id="fwl-name"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t.form.fields.name.placeholder}
              maxLength={40}
              className={inputClass}
              autoComplete="name"
            />
          </Field>

          {/* Email */}
          <Field label={t.form.fields.email.label} htmlFor="fwl-email" required>
            <input
              id="fwl-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder={t.form.fields.email.placeholder}
              className={inputClass}
              autoComplete="email"
            />
          </Field>

          {/* Current status */}
          <Field label={t.form.fields.currentStatus.label} htmlFor="fwl-status" required>
            <select
              id="fwl-status"
              value={form.currentStatus}
              onChange={(e) => update("currentStatus", e.target.value)}
              className={selectClass}
            >
              <option value="">{t.form.placeholderSelect}</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "ko" ? o.ko : o.en}
                </option>
              ))}
            </select>
          </Field>

          {/* Concern */}
          <Field label={t.form.fields.futureConcern.label} htmlFor="fwl-concern" required>
            <select
              id="fwl-concern"
              value={form.futureConcern}
              onChange={(e) => update("futureConcern", e.target.value)}
              className={selectClass}
            >
              <option value="">{t.form.placeholderSelect}</option>
              {CONCERN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "ko" ? o.ko : o.en}
                </option>
              ))}
            </select>
          </Field>

          {/* Track */}
          <Field label={t.form.fields.reportTrack.label} htmlFor="fwl-track" required>
            <select
              id="fwl-track"
              value={form.reportTrack}
              onChange={(e) => update("reportTrack", e.target.value)}
              className={selectClass}
            >
              <option value="">{t.form.placeholderSelect}</option>
              {TRACK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "ko" ? o.ko : o.en}
                </option>
              ))}
            </select>
          </Field>

          {/* Question */}
          <Field label={t.form.fields.question.label} htmlFor="fwl-question">
            <textarea
              id="fwl-question"
              value={form.question}
              onChange={(e) => update("question", e.target.value)}
              placeholder={t.form.fields.question.placeholder}
              maxLength={300}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* Report language */}
          <Field label={t.form.fields.reportLang.label} htmlFor="fwl-lang" required>
            <select
              id="fwl-lang"
              value={form.reportLang}
              onChange={(e) => update("reportLang", e.target.value as InterestForm["reportLang"])}
              className={selectClass}
            >
              <option value="">{t.form.placeholderSelect}</option>
              {REPORT_LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {lang === "ko" ? o.ko : o.en}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#C9A24B] text-[#0B1B2B] px-8 py-4 text-[15px] font-semibold tracking-tight hover:bg-[#D8B260] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_24px_rgba(201,162,75,0.18)]"
          >
            {submitting ? t.form.submitting : t.form.submit}
          </button>
        </form>
      </section>

      <footer className="px-5 md:px-8 pb-12 text-center text-[12px] text-[rgba(242,235,220,0.4)]">
        {t.footer}
      </footer>
    </main>
  );
}

// =====================================================================
// Helpers — small inline components / styles
// =====================================================================

const inputClass =
  "w-full rounded-xl border border-[rgba(201,162,75,0.22)] bg-[#0B1B2B]/80 px-4 py-3 text-[15px] text-[#F2EBDC] placeholder:text-[rgba(242,235,220,0.35)] outline-none focus:border-[#C9A24B] focus:ring-1 focus:ring-[#C9A24B] transition-colors";

const selectClass = `${inputClass} appearance-none pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23C9A24B%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_14px_center]`;

function Section({
  labelMono,
  title,
  children,
}: {
  labelMono: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 md:px-8 pb-12 md:pb-16 max-w-3xl mx-auto">
      <div className="label-mono text-[11px] text-[#C9A24B] mb-3">{labelMono}</div>
      <h2
        className="text-[22px] md:text-[26px] font-bold leading-tight mb-5"
        style={{ fontFamily: "var(--font-gowun-batang), 'Noto Serif KR', serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[12px] font-semibold tracking-wide text-[rgba(242,235,220,0.75)] mb-2"
      >
        {label}
        {required ? <span className="ml-1 text-[#C9A24B]">*</span> : null}
      </label>
      {children}
    </div>
  );
}
