import { describe, expect, it } from "vitest";
import { compileP17, hasPressureLanguage, stripPressureSentences, PERMANENT_LIMITS, permanentLimits } from "@/lib/v3/p17";
import { EMPTY_STEP2, type Step2Input } from "@/lib/v3/types";

describe("compileP17 — 빈 입력 필드가 곧 한계 문장이 된다", () => {
  it("2단계를 건너뛰면 5개 필드 전부 한계로 기재된다", () => {
    const entries = compileP17(null);
    expect(entries).toHaveLength(5);
    expect(entries.map((e) => e.field)).toContain("일에 대한 만족도");
    expect(entries.map((e) => e.field)).toContain("가장 큰 고민 (자유 서술)");
  });

  it("전부 비어 있으면 EMPTY_STEP2도 5개 한계를 만든다", () => {
    expect(compileP17(EMPTY_STEP2)).toHaveLength(5);
  });

  it("채운 필드는 한계 목록에서 사라진다", () => {
    const step2: Step2Input = {
      ...EMPTY_STEP2,
      workType: "프리랜서·1인 사업",
      satisfaction: "대체로 만족한다",
    };
    const fields = compileP17(step2).map((e) => e.field);
    expect(fields).not.toContain("근무 형태");
    expect(fields).not.toContain("일에 대한 만족도");
    expect(fields).toContain("연차");
    expect(fields).toHaveLength(3);
  });

  it("전부 채우면 받지 못한 입력값이 없다", () => {
    const full: Step2Input = {
      workType: "정규직 (조직 소속)",
      years: "7~15년",
      satisfaction: "보통이다",
      direction: "아직 모르겠다 — 그래서 알아보는 중이다",
      concern: "AI가 내 업무 일부를 이미 하고 있다",
    };
    expect(compileP17(full)).toHaveLength(0);
  });

  it("공백만 쓴 자유 서술은 빈 것으로 취급한다", () => {
    const step2: Step2Input = { ...EMPTY_STEP2, concern: "   " };
    expect(compileP17(step2).map((e) => e.field)).toContain("가장 큰 고민 (자유 서술)");
  });

  it("입력을 다 채워도 사라지지 않는 근본 한계가 존재한다", () => {
    expect(PERMANENT_LIMITS.length).toBeGreaterThanOrEqual(2);
  });

  it("영어로도 한계 문장과 근본 한계를 만든다", () => {
    const entries = compileP17(null, "en");
    expect(entries).toHaveLength(5);
    expect(entries.map((e) => e.field)).toContain("How you feel about your work");
    expect(permanentLimits("en").length).toBeGreaterThanOrEqual(2);
    expect(permanentLimits("en")[0]).toMatch(/statistics|trends/);
  });
});

describe("불안 주입 방지 — 시간 압박 표현 필터 (명세서 §2-3)", () => {
  it("금지 표현을 감지한다", () => {
    expect(hasPressureLanguage("지금 행동하지 않으면 늦습니다")).toBe(true);
    expect(hasPressureLanguage("늦기 전에 준비하세요")).toBe(true);
    expect(hasPressureLanguage("지금이 골든타임입니다")).toBe(true);
    expect(hasPressureLanguage("지금 결제하면 30% 할인")).toBe(true);
  });

  it("정상 문장은 통과한다", () => {
    expect(hasPressureLanguage("당신의 속도로 준비하시면 됩니다")).toBe(false);
    expect(hasPressureLanguage("머무름을 더 단단하게 만드는 방향을 제안합니다")).toBe(false);
  });

  it("배열에서 압박 문장만 제거한다", () => {
    const lines = [
      "프리랜서 형태는 조직의 완충이 없어 변동에 더 노출됩니다",
      "지금 행동하지 않으면 기회를 놓칩니다",
      "15년의 경력은 쉽게 대체되지 않는 자산입니다",
    ];
    const filtered = stripPressureSentences(lines);
    expect(filtered).toHaveLength(2);
    expect(filtered.some((l) => l.includes("행동하지 않으면"))).toBe(false);
  });
});
