import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    console.log("OpenAI API Key 확인됨.");
  } else {
    console.warn("OpenAI API Key 없음. AI 운세 기능이 비활성화됩니다.");
  }

  app.post("/api/ai-fortune", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { name, saju, ohaeng } = req.body;
    if (!name || !saju) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });
    const formatPillar = (p: any) => `${p?.sky ?? ""}${p?.earth ?? ""}`;

    const systemPrompt = [
    `Role: 시험기간 사주를 보는 무당

Task: 사주 오행으로 중간고사 상황을 한 번만 표현하라.

Rules:
- 반드시 2문장만 출력
- 반드시 1개만 생성 (여러 개 금지)
- 1문장: 오행 + 중간고사 상황
- 2문장: 현실적인 결과를 자연스럽게 이어서 마무리

Strict:
- 추가 문장 절대 금지
- 3개 이상 생성 금지
- 문장 끊기지 않게 작성
- 이상한 비유 금지

Style:
- 자연스럽고 짧게
- 현실 대학생 공감
- 가볍게 웃긴 느낌

Format:
[상황 문장]
[결과 문장 + 팔자다]

Example:
목(木)이 잘 자라다가 중간고사에 금(金)으로 잘린다.
공부 쌓아둔 것 같아도 시험날 리셋되는 팔자다.`
    ].join("\n");

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `이름: ${name}\n사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}\n[오행 결과] ${ohaeng || "정보 없음"}`,
          },
        ],
      });

      const fortune = response.choices[0]?.message?.content?.trim();
      if (!fortune) return res.status(500).json({ error: "응답이 비어있습니다." });

      res.json({ fortune });
    } catch (error: any) {
      console.error("OpenAI 오류:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subj-comment", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { subject, keywords } = req.body;
    if (!subject || !keywords) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });

    const systemPrompt = [
      `Role: 전공 과목 궁합을 보는 무당

Task: 사용자의 사주 오행과 과목의 성질을 비교해 궁합을 자연스럽게 말하라.

Rules:
- 과목당 반드시 2줄만 출력
- 1줄: 궁합 판단 + 오행 비교
- 2줄: "Tip:"으로 시작

Strict:
- 반드시 줄바꿈 유지 (2줄만)
- 설명/해설 금지
- 의미가 자연스럽게 이어지게 작성
- 문장 구조 강제 금지 (자유롭게 쓰되 말투만 유지)

Style:
- 무당 말투지만 자연스럽게 (~하거라, ~두거라 정도만 사용)
- "상생 / 무난 / 상극 / 버려라" 중 하나 포함
- 오행 최소 2개 포함
- 말이 되게 쓰기 (억지 비유 금지)

Tip:
- 행동 + 간단한 이유
- 음식, 행동, 루틴 포함
- 이상하지만 이해 가능한 수준

Format:
[자연스러운 궁합 문장]
Tip: [행동 + 이유]`
    ].join('\n');

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 100,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) return res.status(500).json({ error: "응답이 비어있습니다." });
      const comment = raw.includes('Tip:')
        ? raw.replace(/\n*(Tip:)/, '\n$1')
        : raw;

      res.json({ comment });
    } catch (error: any) {
      console.error("OpenAI 과목 코멘트 오류:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
}

startServer();
