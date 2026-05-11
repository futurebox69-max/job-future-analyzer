#!/usr/bin/env python3
"""
Nemotron-Personas-Korea 데이터셋 처리 파이프라인
================================================
NVIDIA Nemotron-Personas-Korea (100만+ 합성 페르소나)를
REFRAME / 내 직업의 미래 / 역량평가 앱에서 사용할 JSON으로 가공.

사용법:
  pip install datasets pandas numpy --break-system-packages
  python scripts/nemotron/process-dataset.py

출력 (public/data/ 디렉토리):
  - occupation-stats.json        → 직업별 통계 (인원수, 연령분포, 스킬)
  - occupation-cache.json        → 직업 대체율 캐시 기본 데이터
  - age-occupation-matrix.json   → 연령×직업 교차 분석
  - region-occupation-map.json   → 지역×직업 분포 맵
  - skill-transition-graph.json  → 직업 간 스킬 겹침 그래프
  - competency-benchmarks.json   → 직업별 역량 프로파일 벤치마크
  - persona-samples.json         → B2B 데모용 샘플 페르소나
  - population-distribution.json → 인구 분포 (백분위 계산용)
"""

import json
import sys
import os
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import pandas as pd

# ── 설정 ──
OUTPUT_DIR = Path(__file__).parent.parent.parent / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 샘플 크기 (전체 처리 시 None, 테스트 시 10000)
SAMPLE_SIZE = None

# ── 6차원 역량 모델: 직업 → 역량 매핑 규칙 ──
# professional_persona + skills_and_expertise에서 키워드 기반 추론
COMPETENCY_KEYWORDS = {
    "structural": [
        "분석", "데이터", "통계", "구조", "설계", "시스템", "논리", "프로그래밍",
        "수학", "공학", "알고리즘", "모델링", "계획", "전략", "research",
        "analysis", "engineering", "architecture", "planning", "statistics",
    ],
    "creative": [
        "창의", "디자인", "예술", "혁신", "콘텐츠", "기획", "아이디어", "상상",
        "브랜드", "스토리", "작곡", "연출", "creative", "design", "innovation",
        "art", "writing", "content", "storytelling",
    ],
    "emotional": [
        "상담", "공감", "소통", "돌봄", "케어", "심리", "감정", "교육", "코칭",
        "멘토", "치유", "복지", "counseling", "empathy", "care", "emotional",
        "therapy", "social work", "nursing",
    ],
    "adaptive": [
        "변화", "적응", "민첩", "학습", "빠른", "유연", "도전", "스타트업",
        "트렌드", "디지털", "agile", "adaptive", "flexible", "learning",
        "startup", "pivot", "innovation",
    ],
    "ethical": [
        "윤리", "법률", "규제", "공정", "정의", "판단", "책임", "감사",
        "컴플라이언스", "보안", "ethics", "legal", "compliance", "justice",
        "audit", "regulation", "integrity",
    ],
    "collab": [
        "협업", "팀", "리더", "매니지", "조직", "네트워크", "파트너", "조율",
        "커뮤니케이션", "프로젝트", "team", "leadership", "collaboration",
        "management", "coordination", "partnership",
    ],
}

# 8차원 대체율 모델: 직업 카테고리 → 대체율 범위 매핑
REPLACEMENT_HEURISTICS = {
    "반복_고": ["사무", "행정", "경리", "창고", "물류", "택배", "콜센터", "은행원", "텔러"],
    "반복_저": ["의사", "변호사", "교수", "연구원", "예술가", "작가", "음악가"],
    "인지_고": ["회계사", "세무사", "감정평가사", "통계", "데이터"],
    "신체_고": ["건설", "용접", "배관", "운전", "배달", "농업", "어업"],
    "창의_고": ["디자이너", "작곡", "PD", "감독", "연출", "작가", "화가"],
    "소통_고": ["교사", "간호사", "상담사", "사회복지사", "코치", "목사"],
    "윤리_고": ["판사", "검사", "경찰", "소방", "군인", "의사"],
}


def load_dataset_streaming():
    """HuggingFace 데이터셋을 스트리밍으로 로드"""
    try:
        from datasets import load_dataset
        print("📥 Nemotron-Personas-Korea 데이터셋 로딩 중...")
        ds = load_dataset("nvidia/Nemotron-Personas-Korea", split="train", streaming=True)
        return ds
    except Exception as e:
        print(f"❌ 데이터셋 로딩 실패: {e}")
        print("💡 pip install datasets 후 다시 시도하세요")
        sys.exit(1)


def extract_competency_scores(text: str) -> dict:
    """텍스트에서 6차원 역량 점수 추출 (키워드 빈도 기반)"""
    if not text:
        return {k: 50 for k in COMPETENCY_KEYWORDS}

    text_lower = text.lower()
    scores = {}

    for comp, keywords in COMPETENCY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw.lower() in text_lower)
        # 키워드 매칭 수를 0-100 스케일로 변환 (최대 5개 매칭 = 100)
        scores[comp] = min(100, max(20, count * 20))

    return scores


def estimate_replacement_rate(occupation: str, skills_text: str = "") -> dict:
    """직업명과 스킬에서 8차원 대체율 추정"""
    base = {
        "repetitive": 50, "cognitive": 45, "physical": 30,
        "creative": 35, "social": 35, "ethical": 30,
        "techVelocity": 50, "regulatory": 40,
    }

    if not occupation:
        return base

    occ_lower = occupation.lower()

    for category, keywords in REPLACEMENT_HEURISTICS.items():
        for kw in keywords:
            if kw in occ_lower:
                if "반복_고" in category:
                    base["repetitive"] = min(90, base["repetitive"] + 30)
                    base["cognitive"] = min(80, base["cognitive"] + 15)
                elif "반복_저" in category:
                    base["repetitive"] = max(15, base["repetitive"] - 25)
                elif "인지_고" in category:
                    base["cognitive"] = min(85, base["cognitive"] + 25)
                elif "신체_고" in category:
                    base["physical"] = min(80, base["physical"] + 35)
                elif "창의_고" in category:
                    base["creative"] = max(10, base["creative"] - 25)
                elif "소통_고" in category:
                    base["social"] = max(10, base["social"] - 25)
                elif "윤리_고" in category:
                    base["ethical"] = max(10, base["ethical"] - 20)
                    base["regulatory"] = min(80, base["regulatory"] + 25)
                break

    return base


def process_personas(ds):
    """페르소나 데이터 처리 메인 루프"""

    # 수집 구조
    occupation_data = defaultdict(lambda: {
        "count": 0,
        "ages": [],
        "regions": [],
        "skills": [],
        "career_goals": [],
        "competency_scores": [],
        "education": [],
    })

    region_occupation = defaultdict(lambda: defaultdict(int))
    age_occupation = defaultdict(lambda: defaultdict(int))
    all_personas_sample = []

    print("🔄 페르소나 처리 시작...")

    count = 0
    for record in ds:
        count += 1
        if SAMPLE_SIZE and count > SAMPLE_SIZE:
            break

        if count % 50000 == 0:
            print(f"  처리 중: {count:,}건...")

        # 필드 추출 (데이터셋 스키마에 따라 유연하게)
        occupation = record.get("occupation", "") or ""
        age = record.get("age", 0) or 0
        region = record.get("region", "") or record.get("location", "") or ""
        sex = record.get("sex", "") or ""
        education = record.get("education", "") or ""
        skills = record.get("skills_and_expertise", "") or ""
        career_goals = record.get("career_goals_and_ambitions", "") or ""
        persona = record.get("persona", "") or ""
        professional = record.get("professional_persona", "") or ""

        if not occupation:
            continue

        # 직업별 통계 수집
        occ_data = occupation_data[occupation]
        occ_data["count"] += 1
        if age:
            occ_data["ages"].append(int(age) if isinstance(age, (int, float)) else 30)
        if region:
            occ_data["regions"].append(region)
        if skills:
            occ_data["skills"].append(skills[:200])  # 잘라서 저장
        if career_goals:
            occ_data["career_goals"].append(career_goals[:200])
        if education:
            occ_data["education"].append(education)

        # 역량 점수 추출
        combined_text = f"{skills} {professional} {career_goals}"
        comp_scores = extract_competency_scores(combined_text)
        occ_data["competency_scores"].append(comp_scores)

        # 교차 분석
        age_group = get_age_group(age)
        if region:
            region_occupation[region][occupation] += 1
        if age_group:
            age_occupation[age_group][occupation] += 1

        # 샘플 수집 (B2B 데모용, 1000개)
        if len(all_personas_sample) < 1000:
            all_personas_sample.append({
                "occupation": occupation,
                "age": age,
                "region": region,
                "sex": sex,
                "education": education,
                "skills_summary": skills[:150] if skills else "",
                "career_goals_summary": career_goals[:150] if career_goals else "",
            })

    print(f"✅ 총 {count:,}건 처리 완료. 직업 {len(occupation_data)}개 발견.")

    return occupation_data, region_occupation, age_occupation, all_personas_sample


def get_age_group(age) -> str:
    """나이를 연령대 그룹으로 변환"""
    try:
        age = int(age)
    except (ValueError, TypeError):
        return ""

    if age < 20: return "10대"
    elif age < 30: return "20대"
    elif age < 40: return "30대"
    elif age < 50: return "40대"
    elif age < 60: return "50대"
    else: return "60대+"


def build_occupation_stats(occupation_data: dict) -> list:
    """직업별 통계 JSON 빌드"""
    stats = []

    for occ, data in occupation_data.items():
        if data["count"] < 3:  # 최소 3명 이상인 직업만
            continue

        ages = data["ages"]
        age_dist = Counter(get_age_group(a) for a in ages if get_age_group(a))
        region_dist = Counter(data["regions"])
        edu_dist = Counter(data["education"])

        # 역량 점수 평균 계산
        comp_scores = data["competency_scores"]
        avg_competency = {}
        if comp_scores:
            for key in ["structural", "creative", "emotional", "adaptive", "ethical", "collab"]:
                vals = [s.get(key, 50) for s in comp_scores]
                avg_competency[key] = round(np.mean(vals), 1)

        # 스킬 키워드 빈도 (상위 10개)
        all_skills_text = " ".join(data["skills"])
        skill_words = [w for w in all_skills_text.split() if len(w) > 1]
        top_skills = [w for w, _ in Counter(skill_words).most_common(10)]

        # 대체율 추정
        replacement = estimate_replacement_rate(occ, all_skills_text)

        stats.append({
            "occupation": occ,
            "count": data["count"],
            "avgAge": round(np.mean(ages), 1) if ages else None,
            "ageDistribution": dict(age_dist.most_common(6)),
            "topRegions": dict(region_dist.most_common(5)),
            "educationDistribution": dict(edu_dist.most_common(5)),
            "avgCompetency": avg_competency,
            "topSkills": top_skills,
            "estimatedReplacement": replacement,
        })

    stats.sort(key=lambda x: x["count"], reverse=True)
    return stats


def build_skill_transition_graph(occupation_data: dict) -> list:
    """직업 간 스킬 겹침 그래프 (전환 경로 근거)"""
    # 상위 100개 직업만 처리
    top_occupations = sorted(
        occupation_data.items(),
        key=lambda x: x[1]["count"],
        reverse=True
    )[:100]

    edges = []
    occ_skills = {}

    # 각 직업의 스킬 키워드 집합
    for occ, data in top_occupations:
        all_text = " ".join(data["skills"])
        words = set(w.lower() for w in all_text.split() if len(w) > 1)
        occ_skills[occ] = words

    # 직업 간 스킬 겹침도 계산 (Jaccard 유사도)
    occ_list = list(occ_skills.keys())
    for i in range(len(occ_list)):
        for j in range(i + 1, len(occ_list)):
            occ_a, occ_b = occ_list[i], occ_list[j]
            skills_a, skills_b = occ_skills[occ_a], occ_skills[occ_b]

            if not skills_a or not skills_b:
                continue

            intersection = len(skills_a & skills_b)
            union = len(skills_a | skills_b)
            similarity = intersection / union if union > 0 else 0

            if similarity > 0.15:  # 15% 이상 겹침만
                edges.append({
                    "from": occ_a,
                    "to": occ_b,
                    "similarity": round(similarity, 3),
                    "sharedSkillCount": intersection,
                })

    edges.sort(key=lambda x: x["similarity"], reverse=True)
    return edges[:500]  # 상위 500개 연결만


def build_competency_benchmarks(occupation_data: dict) -> list:
    """직업별 역량 벤치마크 (Assessment 상위 N% 비교용)"""
    benchmarks = []

    for occ, data in occupation_data.items():
        if data["count"] < 10:  # 최소 10명
            continue

        comp_scores = data["competency_scores"]
        if not comp_scores:
            continue

        benchmark = {"occupation": occ, "sampleSize": len(comp_scores)}

        for key in ["structural", "creative", "emotional", "adaptive", "ethical", "collab"]:
            vals = [s.get(key, 50) for s in comp_scores]
            benchmark[key] = {
                "mean": round(np.mean(vals), 1),
                "std": round(np.std(vals), 1),
                "p25": round(np.percentile(vals, 25), 1),
                "p50": round(np.percentile(vals, 50), 1),
                "p75": round(np.percentile(vals, 75), 1),
                "p90": round(np.percentile(vals, 90), 1),
            }

        benchmarks.append(benchmark)

    benchmarks.sort(key=lambda x: x["sampleSize"], reverse=True)
    return benchmarks


def build_population_distribution(occupation_data: dict) -> dict:
    """전체 인구 역량 분포 (백분위 계산용)"""
    all_scores = defaultdict(list)

    for occ, data in occupation_data.items():
        for scores in data["competency_scores"]:
            for key, val in scores.items():
                all_scores[key].append(val)

    distribution = {}
    for key, vals in all_scores.items():
        arr = np.array(vals)
        distribution[key] = {
            "totalCount": len(vals),
            "mean": round(np.mean(arr), 2),
            "std": round(np.std(arr), 2),
            "percentiles": {
                str(p): round(np.percentile(arr, p), 1)
                for p in range(5, 100, 5)
            },
        }

    return distribution


def save_json(data, filename: str):
    """JSON 저장"""
    filepath = OUTPUT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size_kb = filepath.stat().st_size / 1024
    print(f"  💾 {filename} ({size_kb:.1f} KB)")


def main():
    print("=" * 60)
    print("🚀 Nemotron-Personas-Korea 데이터 처리 파이프라인")
    print("=" * 60)

    # 1. 데이터셋 로드
    ds = load_dataset_streaming()

    # 2. 페르소나 처리
    occupation_data, region_occupation, age_occupation, samples = process_personas(ds)

    # 3. 출력 파일 생성
    print("\n📦 출력 파일 생성 중...")

    # 3-1. 직업별 통계
    occ_stats = build_occupation_stats(occupation_data)
    save_json(occ_stats, "occupation-stats.json")

    # 3-2. 직업 대체율 캐시 (직업명 → 8차원 대체율)
    cache = {}
    for stat in occ_stats:
        cache[stat["occupation"]] = {
            "replacement": stat["estimatedReplacement"],
            "count": stat["count"],
            "avgAge": stat["avgAge"],
        }
    save_json(cache, "occupation-cache.json")

    # 3-3. 연령×직업 교차
    age_occ_matrix = {}
    for age_group, occupations in age_occupation.items():
        top_30 = sorted(occupations.items(), key=lambda x: x[1], reverse=True)[:30]
        age_occ_matrix[age_group] = dict(top_30)
    save_json(age_occ_matrix, "age-occupation-matrix.json")

    # 3-4. 지역×직업 분포
    region_occ_map = {}
    for region, occupations in region_occupation.items():
        top_20 = sorted(occupations.items(), key=lambda x: x[1], reverse=True)[:20]
        region_occ_map[region] = dict(top_20)
    save_json(region_occ_map, "region-occupation-map.json")

    # 3-5. 스킬 전환 그래프
    transition_graph = build_skill_transition_graph(occupation_data)
    save_json(transition_graph, "skill-transition-graph.json")

    # 3-6. 역량 벤치마크
    benchmarks = build_competency_benchmarks(occupation_data)
    save_json(benchmarks, "competency-benchmarks.json")

    # 3-7. B2B 데모용 샘플
    save_json(samples, "persona-samples.json")

    # 3-8. 인구 분포 (백분위)
    population = build_population_distribution(occupation_data)
    save_json(population, "population-distribution.json")

    print(f"\n✅ 완료! {len(os.listdir(OUTPUT_DIR))}개 파일 생성됨: {OUTPUT_DIR}")
    print("\n다음 단계:")
    print("  1. npm run build 로 앱 빌드")
    print("  2. 앱에서 자동으로 public/data/ 파일을 읽어 사용합니다")


if __name__ == "__main__":
    main()
