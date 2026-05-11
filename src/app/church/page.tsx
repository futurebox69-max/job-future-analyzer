"use client";

import { useEffect } from "react";
import Link from "next/link";

const PRIMARY = "#6C63FF";
const DARK = "#1E1B4B";
const BG = "#F5F4FF";
const WHITE = "#FFFFFF";
const BORDER = "#E8E6FF";
const MUTED = "#6B7280";
const ACCENT = "#EDE9FE";
const WARM = "#FFF7ED";
const WARM_BORDER = "#FED7AA";

export default function ChurchPage() {
  useEffect(() => {
    document.title = "교회 라이선스 | 내 직업의 미래";
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
        background: `linear-gradient(150deg, #1E1B4B 0%, #312E81 45%, #4338CA 100%)`,
        color: WHITE,
        padding: "80px 24px 72px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle cross ornament */}
        <div style={{
          position: "absolute",
          top: "24px",
          right: "40px",
          fontSize: "48px",
          opacity: 0.08,
          userSelect: "none",
          pointerEvents: "none",
        }}>
          </div>
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "32px",
          fontSize: "36px",
          opacity: 0.06,
          userSelect: "none",
          pointerEvents: "none",
        }}>
          </div>

        <div style={{ maxWidth: "760px", margin: "0 auto", position: "relative", zIndex: 1 }}>
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
            교회 라이선스
          </div>
          <h1 style={{
            fontSize: "clamp(26px, 4.5vw, 44px)",
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}>
            목회자를 위한 AI 시대<br />진로 목회 도구
          </h1>
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 19px)",
            lineHeight: 1.8,
            opacity: 0.88,
            marginBottom: "40px",
            fontWeight: 400,
          }}>
            교인들의 직업 불안을 데이터로 응답하고,<br />
            하나님 나라를 위한 커리어를 함께 설계하세요
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:futurebox69@gmail.com?subject=교회 라이선스 문의" style={{
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
              도입 문의하기
            </a>
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
              요금 확인
            </a>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section style={{ padding: "72px 24px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 800,
          marginBottom: "12px",
          color: DARK,
        }}>
          목회자라면 한 번쯤 겪어봤을 상황
        </h2>
        <p style={{
          textAlign: "center",
          color: MUTED,
          fontSize: "16px",
          marginBottom: "48px",
          lineHeight: 1.6,
        }}>
          이제 데이터로 응답할 수 있습니다
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        }}>
          {[
            {
              icon: "",
              situation: "교인이 '내 직업 없어질 것 같아요'라고 찾아올 때",
              response: "감정적 위로를 넘어 구체적인 데이터와 전략을 함께 제시할 수 있습니다.",
            },
            {
              icon: "",
              situation: "청년부 진로 상담, 막막할 때",
              response: "청년들이 고민하는 직업의 미래를 객관적 수치로 분석하고 커리어 경로를 함께 그릴 수 있습니다.",
            },
            {
              icon: "",
              situation: "교회 공동체가 AI 시대를 함께 준비하려 할 때",
              response: "소그룹 워크숍 자료와 설교 준비 리포트로 공동체 전체가 방향을 잡도록 돕습니다.",
            },
          ].map((card, i) => (
            <div key={i} style={{
              background: WARM,
              border: `1px solid ${WARM_BORDER}`,
              borderRadius: "16px",
              padding: "32px 28px",
              boxShadow: "0 2px 12px rgba(108,99,255,0.06)",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>{card.icon}</div>
              <p style={{
                fontSize: "15px",
                fontWeight: 700,
                color: DARK,
                marginBottom: "14px",
                lineHeight: 1.5,
              }}>
                "{card.situation}"
              </p>
              <p style={{ fontSize: "14px", color: MUTED, lineHeight: 1.7 }}>
                {card.response}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature List */}
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
            교회 라이선스 포함 내용
          </h2>
          <p style={{
            textAlign: "center",
            color: MUTED,
            fontSize: "16px",
            marginBottom: "48px",
          }}>
            목회 현장에 바로 사용할 수 있는 도구 일체
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}>
            {[
              {
                icon: "",
                title: "교인 50명 계정",
                desc: "성인·청소년 구분 없이 50개 계정을 자유롭게 배정하세요.",
              },
              {
                icon: "",
                title: "AI 시대 직업 불안 상담 자료",
                desc: "목회자 전용 상담 가이드라인과 대화 프레임워크를 제공합니다.",
              },
              {
                icon: "",
                title: "설교 준비용 주간 직업 트렌드 리포트",
                desc: "매주 AI 시대 직업 변화 트렌드를 설교에 활용할 수 있는 형식으로 받아보세요.",
              },
              {
                icon: "",
                title: "소그룹 커리어 워크숍 자료",
                desc: "청년부·직장인 소그룹에서 바로 진행할 수 있는 워크숍 커리큘럼을 제공합니다.",
              },
              {
                icon: "",
                title: "전담 이메일 지원",
                desc: "도입 초기부터 운영 전반에 걸쳐 전담 담당자가 이메일로 지원합니다.",
              },
              {
                icon: "",
                title: "무제한 직업 분석",
                desc: "50명 계정 모두 횟수 제한 없이 무제한으로 분석할 수 있습니다.",
              },
            ].map((feature, i) => (
              <div key={i} style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: "14px",
                padding: "24px 22px",
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
              }}>
                <div style={{
                  fontSize: "28px",
                  flexShrink: 0,
                  width: "44px",
                  height: "44px",
                  background: ACCENT,
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "6px", color: DARK }}>{feature.title}</h3>
                  <p style={{ fontSize: "13px", color: MUTED, lineHeight: 1.65 }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "72px 24px", maxWidth: "640px", margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center",
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 800,
          marginBottom: "12px",
          color: DARK,
        }}>
          교회 라이선스 요금
        </h2>
        <p style={{
          textAlign: "center",
          color: MUTED,
          fontSize: "16px",
          marginBottom: "48px",
        }}>
          규모에 관계없이 동일한 요금으로 시작
        </p>

        <div style={{
          background: `linear-gradient(150deg, #1E1B4B 0%, #312E81 100%)`,
          borderRadius: "24px",
          padding: "40px 36px",
          color: WHITE,
          boxShadow: "0 8px 40px rgba(30,27,75,0.25)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            background: "rgba(108,99,255,0.15)",
            borderRadius: "50%",
          }} />
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "130px",
            height: "130px",
            background: "rgba(67,56,202,0.2)",
            borderRadius: "50%",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
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
              CHURCH LICENSE
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "clamp(36px, 6vw, 52px)", fontWeight: 900, lineHeight: 1 }}>
                ₩49,900
              </span>
              <span style={{ fontSize: "16px", opacity: 0.75, marginBottom: "6px" }}>/월</span>
            </div>
            <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "8px" }}>
              교회 50명 기준
            </p>

            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(16,185,129,0.2)",
              border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: "10px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#6EE7B7",
              marginBottom: "32px",
            }}>
              1인당 ₩998 · 개인 요금제 대비 95% 절감
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "28px", marginBottom: "32px" }}>
              {[
                "교인 50명 계정 (성인 + 청소년)",
                "무제한 직업 분석",
                "AI 시대 직업 불안 상담 자료 (목회자용)",
                "설교 준비용 주간 직업 트렌드 리포트",
                "청년부·직장인 소그룹 커리어 워크숍 자료",
                "전담 지원 (이메일)",
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

            <a href="mailto:futurebox69@gmail.com?subject=교회 라이선스 문의" style={{
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
              도입 문의하기
            </a>

            <p style={{ textAlign: "center", fontSize: "13px", opacity: 0.6, marginTop: "14px" }}>
              담당자가 48시간 내 연락드립니다
            </p>
          </div>
        </div>

        {/* Per-person comparison */}
        <div style={{
          marginTop: "24px",
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: "12px",
          padding: "20px 24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            {[
              { label: "개인 프리미엄", price: "₩39,900", sub: "1명", highlight: false },
              { label: "가족 플랜", price: "₩29,900", sub: "3명", highlight: false },
              { label: "교회 라이선스", price: "₩49,900", sub: "50명", highlight: true },
            ].map((item, i) => (
              <div key={i} style={{
                flex: "1",
                minWidth: "120px",
                textAlign: "center",
                padding: "16px 12px",
                borderRadius: "10px",
                background: item.highlight ? ACCENT : "transparent",
                border: item.highlight ? `2px solid ${PRIMARY}` : "none",
              }}>
                <div style={{ fontSize: "12px", color: MUTED, marginBottom: "4px" }}>{item.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: item.highlight ? PRIMARY : DARK }}>{item.price}</div>
                <div style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Placeholder */}
      <section style={{
        background: WARM,
        padding: "64px 24px",
        borderTop: `1px solid ${WARM_BORDER}`,
        borderBottom: `1px solid ${WARM_BORDER}`,
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px", opacity: 0.4 }}></div>
          <h2 style={{
            fontSize: "clamp(18px, 3vw, 26px)",
            fontWeight: 800,
            marginBottom: "32px",
            color: DARK,
          }}>
            AI 시대를 함께 준비하는 교회
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}>
            {[
              {
                quote: "교인 청년들의 직업 불안을 이제 데이터로 함께 들여다볼 수 있게 됐습니다.",
                name: "서울 ○○교회 담당 목사",
              },
              {
                quote: "설교 준비에 직업 트렌드 리포트를 활용하니 청년들의 반응이 달라졌습니다.",
                name: "경기 ○○교회 청년 담당",
              },
            ].map((t, i) => (
              <div key={i} style={{
                background: WHITE,
                border: `1px solid ${WARM_BORDER}`,
                borderRadius: "14px",
                padding: "24px 22px",
                textAlign: "left",
              }}>
                <p style={{
                  fontSize: "14px",
                  color: DARK,
                  lineHeight: 1.75,
                  marginBottom: "16px",
                  fontStyle: "italic",
                }}>
                  "{t.quote}"
                </p>
                <p style={{ fontSize: "13px", color: MUTED, fontWeight: 600 }}>— {t.name}</p>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "12px", color: MUTED, marginTop: "20px" }}>
            * 위 후기는 예시입니다. 실제 도입 교회 후기로 교체될 예정입니다.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "72px 24px",
        textAlign: "center",
        maxWidth: "640px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "clamp(22px, 3.5vw, 32px)",
          fontWeight: 900,
          marginBottom: "16px",
          color: DARK,
          lineHeight: 1.35,
        }}>
          교회가 AI 시대를<br />먼저 준비할 때
        </h2>
        <p style={{
          fontSize: "16px",
          color: MUTED,
          marginBottom: "40px",
          lineHeight: 1.7,
        }}>
          직업 불안 앞에 선 교인들에게<br />
          데이터와 말씀으로 함께 응답하세요
        </p>
        <a href="mailto:futurebox69@gmail.com?subject=교회 라이선스 문의" style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${DARK}, #312E81)`,
          color: WHITE,
          padding: "16px 40px",
          borderRadius: "12px",
          fontWeight: 700,
          fontSize: "16px",
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(30,27,75,0.25)",
          marginBottom: "12px",
        }}>
          도입 문의하기 →
        </a>
        <p style={{ fontSize: "13px", color: MUTED, marginTop: "12px" }}>
          futurebox69@gmail.com · 48시간 내 답변
        </p>
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
