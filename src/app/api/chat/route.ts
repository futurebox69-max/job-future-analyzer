import Anthropic from "@anthropic-ai/sdk";
import { getProfileFromToken } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const FREE_CHAT_LIMIT = 3;

function createAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token) {
    return Response.json({ error: "로그인이 필요합니다.", code: "LOGIN_REQUIRED" }, { status: 401 });
  }

  const profile = await getProfileFromToken(token);
  if (!profile) {
    return Response.json({ error: "인증에 실패했습니다.", code: "AUTH_FAILED" }, { status: 401 });
  }

  const { message, conversationId, jobName, analysisContext, messages: history } = await req.json();

  if (!message?.trim()) {
    return Response.json({ error: "메시지를 입력해주세요." }, { status: 400 });
  }

  // 무료 사용자 챗봇 횟수 체크
  const isAdmin = profile.role === "admin";
  const isPremium = profile.role === "premium";

  if (!isAdmin && !isPremium) {
    const chatCount = (profile as { monthly_chat_count?: number }).monthly_chat_count ?? 0;
    if (chatCount >= FREE_CHAT_LIMIT) {
      return Response.json({
        error: `무료 AI 코치 대화 ${FREE_CHAT_LIMIT}회를 모두 사용하셨습니다. 유료 플랜에서 무제한 이용하세요.`,
        code: "CHAT_LIMIT",
        remaining: 0,
      }, { status: 429 });
    }
  }

  // 시스템 프롬프트 — 분석 결과 포함
  const systemPrompt = `당신은 "내 직업의 미래" 앱의 AI 커리어 코치입니다.
일반 AI와 다르게, 당신은 이 사용자의 직업 분석 결과를 이미 알고 있습니다.

## 사용자 직업 분석 결과
직업명: ${jobName}
${analysisContext ? `분석 데이터: ${JSON.stringify(analysisContext, null, 2)}` : ""}

## 역할
- 분석 결과를 바탕으로 구체적이고 맞춤화된 조언 제공
- 추상적인 조언 금지 — 반드시 이 직업의 데이터 기반으로 답변
- 불안감보다 실행 가능한 다음 단계 제시
- 따뜻하고 현실적인 톤
- 한국어로 답변 (사용자가 다른 언어로 물으면 그 언어로)
- 답변은 3~5문장으로 간결하게`;

  // Claude API 호출
  const prevMessages = (history ?? []).map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...prevMessages, { role: "user", content: message }],
  });

  // 사용 횟수 증가 & 대화 저장 (백그라운드)
  const supabase = createAdminSupabase();

  const newMessages = [
    ...(history ?? []),
    { role: "user", content: message, ts: Date.now() },
  ];

  // 대화 저장/업데이트
  (async () => {
    try {
      const assistantText = await (await stream.finalMessage()).content[0];
      const fullMessages = [
        ...newMessages,
        { role: "assistant", content: (assistantText as { text: string }).text, ts: Date.now() },
      ];

      if (conversationId) {
        await supabase.from("conversations")
          .update({ messages: fullMessages, updated_at: new Date().toISOString() })
          .eq("id", conversationId);
      } else {
        await supabase.from("conversations").insert({
          user_id: profile.id,
          job_name: jobName,
          analysis_summary: analysisContext ?? null,
          messages: fullMessages,
        });
      }

      // 무료 사용자 챗봇 카운트 증가
      if (!isAdmin && !isPremium) {
        await supabase.from("profiles")
          .update({ monthly_chat_count: ((profile as { monthly_chat_count?: number }).monthly_chat_count ?? 0) + 1 })
          .eq("id", profile.id);
      }
    } catch { /* 백그라운드 저장 실패는 무시 */ }
  })();

  // SSE 스트리밍 응답
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
          }
        }
        const remaining = isAdmin || isPremium ? 999 :
          FREE_CHAT_LIMIT - (((profile as { monthly_chat_count?: number }).monthly_chat_count ?? 0) + 1);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, remaining: Math.max(0, remaining) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
