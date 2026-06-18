/**
 * 역량의 지도(skills-map) 결과 코드 연동 — RF-XXXX-XXXX-XXXX-XXXX
 *
 * "역량의 지도" 앱이 생성한 결과 코드를 해독해, 이 앱의 6차원 역량 결과
 * (CompetencyResult)로 변환한다. 코드를 가져오면 앱 내 역량검사를 건너뛴다.
 * 명세서 §4-1 (결과 코드 방식) 구현.
 *
 * 두 앱의 역량 축은 1:1로 매핑된다(이름만 다름):
 *   reframe(창의적 재설계) → creative
 *   structure(구조적 사고)  → structural
 *   empathy(감성 연결)      → emotional
 *   ethics(윤리적 판단)      → ethical
 *   agility(적응 민첩성)     → adaptive
 *   collab(협력적 소통)      → collab
 */

import {
  type CompetencyKey,
  type CompetencyResult,
  type CompetencyScores,
} from "@/types/competency";
import { archetypeLabel, importedMeta } from "@/lib/competency-i18n";
import type { LangCode } from "@/lib/i18n";

// 역량의 지도와 동일한 인코딩 알파벳 (32자, 혼동 문자 I·L·O·U 제외)
const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

// 역량의 지도 코드의 축 순서 (고정 — 바꾸면 기존 코드 해독 불가)
const SOURCE_DIMS = [
  "reframe",
  "structure",
  "empathy",
  "ethics",
  "agility",
  "collab",
] as const;

// 역량의 지도 축 → 이 앱의 역량 키
const DIM_MAP: Record<(typeof SOURCE_DIMS)[number], CompetencyKey> = {
  reframe: "creative",
  structure: "structural",
  empathy: "emotional",
  ethics: "ethical",
  agility: "adaptive",
  collab: "collab",
};

export interface DecodedReframeCode {
  depth: 1 | 2; // 1층 스냅샷 / 2층 프로파일
  track: "adult" | "youth";
  scores: CompetencyScores; // 0~100, 이 앱의 키로 변환됨
}

/** RF 코드 문자열을 해독한다. 형식·체크섬이 어긋나면 null. */
export function decodeReframeCode(code: string): DecodedReframeCode | null {
  const raw = code
    .trim()
    .toUpperCase()
    .replace(/^RF-?/, "")
    .replace(/-/g, "");
  if (raw.length !== 16) return null;
  if ([...raw].some((c) => !ALPHA.includes(c))) return null;

  const body = raw.slice(0, 15);
  const sum = [...body].reduce((s, c) => s + ALPHA.indexOf(c), 0);
  if (ALPHA[sum % 32] !== raw[15]) return null; // 체크섬 불일치

  const depth = ALPHA.indexOf(body[0]);
  if (depth !== 1 && depth !== 2) return null;
  const track: "adult" | "youth" = body[1] === "Y" ? "youth" : "adult";

  const scores = {} as CompetencyScores;
  SOURCE_DIMS.forEach((srcDim, i) => {
    const hi = ALPHA.indexOf(body[3 + i * 2]);
    const lo = ALPHA.indexOf(body[4 + i * 2]);
    scores[DIM_MAP[srcDim]] = Math.min(100, hi * 32 + lo);
  });

  return { depth: depth as 1 | 2, track, scores };
}

/**
 * 해독한 코드로 이 앱의 CompetencyResult를 구성한다.
 * 아키타입은 최상위 축으로 이 앱의 ARCHETYPES에서 도출(앱 내 검사와 동일 방식).
 * metaAnalysis는 "가져온 결과"임을 명시한다.
 */
export function buildCompetencyResultFromCode(
  code: string,
  lang: LangCode
): { result: CompetencyResult; depth: 1 | 2; track: "adult" | "youth" } | null {
  const decoded = decodeReframeCode(code);
  if (!decoded) return null;

  const { scores, depth, track } = decoded;
  const topKey = (Object.entries(scores) as [CompetencyKey, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];
  const arch = archetypeLabel(topKey, lang);
  const meta = importedMeta(lang, depth);

  const result: CompetencyResult = {
    scores,
    topKey,
    archetype: arch.title,
    archetypeEmoji: arch.emoji,
    archetypeSubtitle: arch.subtitle,
    metaAnalysis: {
      questionType: "scenario",
      questionTypeMeaning: meta.meaning,
      avgResponseTime: 0,
      responseStyle: meta.style,
    },
    behaviorData: [],
  };

  return { result, depth, track };
}
