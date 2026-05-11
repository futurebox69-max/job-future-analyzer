"use client";

import { useEffect } from "react";
import Link from "next/link";

const PRIMARY = "#6C63FF";
const DARK = "#1E1B4B";
const BG = "#F5F4FF";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFFFFF";
const BORDER = "#E8E6FF";
const MUTED = "#6B7280";
const ACCENT = "#EDE9FE";

export default function FamilyPage() {
  useEffect(() => {
    document.title = "가족 플랜 | 내 직업의 미래";
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--font-noto-sans-kr), 'Noto Sans KR', sans-serif", color: DARK }}>

      {/* Navigation Header */}
      <header style={{
        background: WHITE,
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 24px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 4px rgba(108,99,255,0.08)",
      }}>
        <Link href="/" style={{
          color: PRIMARY,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "15px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          ← 내 직업의 미래
        </Link>
      </header>

      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${DARK} 0%, #2D2780 50%, #4C46B0 100%)`,
        color: WHITE,
        padding: "80px 24px 72px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(108,99,255,0.35)",
            border: "1px solid rgba(108,99,255,0.5)",
            borderRadius: "20px",
            padding: "6px 18px",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px",
            letterSpacing: "0.04em",
          }}>
            가족 플랜
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 46px)",
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}>
            온 가족의 AI 시대 생존 전략
          </h1>
          <p style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            lineHeight: 1.7,
            opacity: 0.88,
            marginBottom: "40px",
            fontWeight: 400,
          }}>
            부모는 직업을 지키고, 자녀는 미래를 준비하는<br />
            가족 커리어 플래닝
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/?mode=adult" style={{
              background: PRIMARY,
              color: WHITE,
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 16px rgba(108,99,255,0.4)",
            }}>
              지금 무료로 시작하기
            </Link>
            <a href="#pricing" style={{
              background: "rgba(255,255,255,0.12)",
              color: WHITE,
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "14px 32px",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block",
            }}>
              플랜 보기
            </a>
          </div>
        </div>
      </section>

      {/* 3 Personas */}
      <section style={{ padding: "72px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 800,
          marginBottom: "12px",
          color: DARK,
        }}>
          누구를 위한 서비스인가요?
        </h2>
        <p style={{
          textAlign: "center",
          color: MUTED,
          fontSize: "16px",
          marginBottom: "48px",
          lineHeight: 1.6,
        }}>
          가족 구성원 모두가 각자의 고민을 해결할 수 있습니다
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        }}>
          {[
            {
              icon: "‍",
              title: "직장인 부모",
              question: "내 직업, 언제까지 안전할까?",
              desc: "AI가 내 업무를 얼마나 대체할 수 있는지 8차원으로 정밀 분석하고, 지금 준비해야 할 스킬을 확인하세요.",
              tag: "성인 분석",
              tagColor: "#6C63FF",
            },
            {
              icon: "",
              title: "대학생 자녀",
              question: "전공 선택이 맞았을까?",
              desc: "내 전공과 연결된 직업의 AI 대체율을 확인하고, 졸업 전 갖춰야 할 역량을 미리 파악하세요.",
              tag: "청년 분석",
              tagColor: "#7C3AED",
            },
            {
              icon: "",
              title: "중고등학생",
              question: "어떤 직업이 미래에 살아남을까?",
              desc: "관심 직업이 10~20년 후에도 존재할지 데이터로 확인하고, 미래에 강한 커리어 경로를 설계하세요.",
              tag: "청소년 분석",
              tagColor: "#059669",
            },
          ].map((persona, i) => (
            <div key={i} style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: "32px 28px",
              boxShadow: "0 2px 12px rgba(108,99,255,0.07)",
              transition: "box-shadow 0.2s",
            }}>
              <div style={{ fontSize: "44px", marginBottom: "16px" }}>{persona.icon}</div>
              <div style={{
                display: "inline-block",
                background: persona.tagColor + "18",
                color: persona.tagColor,
                borderRadius: "8px",
                padding: "3px 10px",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "12px",
              }}>
                {persona.tag}
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px", color: DARK }}>
                {persona.title}
              </h3>
              <p style={{
                fontSize: "15px",
                fontWeight: 700,
                color: PRIMARY,
                marginBottom: "12px",
                lineHeight: 1.4,
              }}>
                "{persona.question}"
              </p>
              <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>
                {persona.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        background: ACCENT,
        padding: "72px 24px",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: "clamp(22px, 3.5vw, 32px)",
            fontWeight: 800,
            marginBottom: "12px",
            color: DARK,
          }}>
            어떻게 작동하나요?
          </h2>
          <p style={{
            textAlign: "center",
            color: MUTED,
            fontSize: "16px",
            marginBottom: "56px",
          }}>
            3단계로 완성되는 커리어 생존 전략
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            textAlign: "center",
          }}>
            {[
              { step: "1", icon: "⌨️", title: "직업 입력", desc: "분석할 직업명을 입력하세요. 한국어 직업명을 그대로 입력하면 됩니다." },
              { step: "2", icon: "", title: "8차원 AI 분석", desc: "업무 자동화, 창의성, 사회성 등 8가지 차원으로 AI 대체 가능성을 정밀 분석합니다." },
              { step: "3", icon: "", title: "생존 전략 수립", desc: "분석 결과를 바탕으로 지금 당장 시작할 수 있는 구체적인 전략을 제시합니다." },
            ].map((step, i) => (
              <div key={i} style={{ padding: "8px" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  background: `linear-gradient(135deg, ${PRIMARY}, #9B8FFF)`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "13px",
                  fontWeight: 900,
                  color: WHITE,
                  boxShadow: "0 4px 12px rgba(108,99,255,0.3)",
                }}>
                  {step.step}
                </div>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{step.icon}</div>
                <h3 style={{ fontSize: "17px", fontWeight: 800, marginBottom: "10px", color: DARK }}>{step.title}</h3>
                <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Bundle Pricing */}
      <section id="pricing" style={{ padding: "72px 24px", maxWidth: "680px", margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 800,
          marginBottom: "12px",
          color: DARK,
        }}>
          가족 묶음 요금제
        </h2>
        <p style={{
          textAlign: "center",
          color: MUTED,
          fontSize: "16px",
          marginBottom: "48px",
        }}>
          가족 모두가 함께, 더 저렴하게
        </p>

        <div style={{
          background: `linear-gradient(135deg, ${DARK} 0%, #2D2780 100%)`,
          borderRadius: "24px",
          padding: "40px 36px",
          color: WHITE,
          boxShadow: "0 8px 40px rgba(30,27,75,0.25)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circle */}
          <div style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "180px",
            height: "180px",
            background: "rgba(108,99,255,0.2)",
            borderRadius: "50%",
          }} />

          <div style={{
            display: "inline-block",
            background: "rgba(108,99,255,0.4)",
            border: "1px solid rgba(108,99,255,0.6)",
            borderRadius: "20px",
            padding: "5px 14px",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "20px",
            letterSpacing: "0.05em",
          }}>
            FAMILY BUNDLE
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "clamp(36px, 6vw, 52px)", fontWeight: 900, lineHeight: 1 }}>
              ₩29,900
            </span>
            <span style={{ fontSize: "16px", opacity: 0.75, marginBottom: "6px" }}>/월</span>
          </div>
          <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "32px" }}>
            가족 3인 기준 (성인 2명 + 청소년 1명)
          </p>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "28px", marginBottom: "32px" }}>
            {[
              "성인 계정 2개 + 청소년 계정 1개",
              "무제한 직업 분석",
              "가족 대시보드 (결과 한눈에 비교)",
              "8차원 AI 대체율 전체 분석",
              "커리어 전환 경로 제안",
              "월간 직업 트렌드 리포트",
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                fontSize: "15px",
              }}>
                <span style={{
                  width: "20px",
                  height: "20px",
                  background: PRIMARY,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  flexShrink: 0,
                }}>
                  </span>
                {item}
              </div>
            ))}
          </div>

          <Link href="/?mode=adult" style={{
            display: "block",
            background: PRIMARY,
            color: WHITE,
            textAlign: "center",
            padding: "16px",
            borderRadius: "12px",
            fontWeight: 700,
            fontSize: "16px",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(108,99,255,0.4)",
          }}>
            가족 플랜 시작하기
          </Link>

          <p style={{ textAlign: "center", fontSize: "13px", opacity: 0.6, marginTop: "14px" }}>
            첫 3회 분석은 무료 · 언제든지 해지 가능
          </p>
        </div>

        {/* Comparison note */}
        <div style={{
          marginTop: "24px",
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: "12px",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "14px",
          color: MUTED,
        }}>
          <span style={{ fontSize: "24px" }}></span>
          <span>
            개인 스탠다드 요금제(₩19,900) 3개 대비 <strong style={{ color: PRIMARY }}>₩29,800 절감</strong> — 한 명 요금으로 온 가족이 이용
          </span>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: `linear-gradient(135deg, ${PRIMARY} 0%, #9B8FFF 100%)`,
        padding: "72px 24px",
        textAlign: "center",
        color: WHITE,
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 900,
            marginBottom: "16px",
            lineHeight: 1.3,
          }}>
            지금 무료로 시작하기
          </h2>
          <p style={{
            fontSize: "16px",
            opacity: 0.9,
            marginBottom: "40px",
            lineHeight: 1.7,
          }}>
            신용카드 없이 · 첫 3회 무료 분석<br />
            부모와 자녀, 함께 미래를 준비하세요
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/?mode=adult" style={{
              background: WHITE,
              color: PRIMARY,
              padding: "15px 32px",
              borderRadius: "12px",
              fontWeight: 800,
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}>
              성인 분석 시작
            </Link>
            <Link href="/?mode=youth" style={{
              background: "rgba(255,255,255,0.2)",
              color: WHITE,
              border: "1px solid rgba(255,255,255,0.5)",
              padding: "15px 32px",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              display: "inline-block",
            }}>
              청소년 분석 시작
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: DARK,
        color: "rgba(255,255,255,0.5)",
        padding: "32px 24px",
        textAlign: "center",
        fontSize: "13px",
      }}>
        <p>© 2025 내 직업의 미래 · REFRAME · <a href="mailto:futurebox69@gmail.com" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>futurebox69@gmail.com</a></p>
      </footer>

    </div>
  );
}
