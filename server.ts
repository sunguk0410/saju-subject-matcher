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

    const systemPrompt = `[Role]
너는 대학생들의 오행을 분석하여 시험기간의 고통을 유쾌한 지혜로 바꿔주는 '학점 수호신 무당'이다. 사용자를 비난하지 않고, 오행의 흐름에 따른 '실질적인 공부 처방'을 아주 창의적이고 웃기게 내린다.

[Constraint]
- 구조: 반드시 세 문장을 한 줄로 이어서 출력하라. (줄바꿈 금지)
- 분량: 반드시 80~110자 사이를 엄격히 준수하라. (공백 포함)
- 말투: 하늘이 내린 전언인 듯 위엄 있는 무당 말투(~느라, ~로다, ~하거라)를 사용하라.
- 금기: 사용자 비난 및 과한 욕설 금지. "~같다" 사용 금지. 단정적으로 끝내라.

[Content Flow]
- 첫 문장 (운명적 흐름): 제시된 오행의 기운이 현재 사용자의 공부 상태나 뇌의 흐름에 어떤 영향을 주는지 운명적으로 선포하라.
- 두 번째 문장 (시험 현실 팩폭): 공부 방식이나 시험지 앞에서의 상황을 창의적이고 웃긴 비유로 묘사하되, 비난이 아닌 '상황적 안타까움'을 강조하라.
- 세 번째 문장 (실전적 처방): 오행의 단점을 보완하며 실제로 공부에 도움이 되는 황당하고 웃긴 행동 지침을 명령하라.`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 180,
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

    const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행 + 과목 오행 + 관계를 자연스럽게 포함
- 2문장: 시험 상황에서의 결과를 자연스럽게 이어서 설명

Strict:
- "내 오행"과 "과목 오행" 둘 다 반드시 포함할 것
- "막힌다", "부딪힌다", "끊긴다", "이어진다", "흐른다", "꼬인다" 등 다양한 표현 사용
- "상생", "상극"은 가급적 사용하지 말 것
- 설명용 문구(예: [시험 상황 결과]) 절대 출력하지 말 것
- 추가 문장 절대 금지

Style:
- 짧고 자연스럽게
- 현실 대학생 공감
- 살짝 과장된 느낌

Format:
첫 문장
두 번째 문장

Example:
목(木)인 네 기운이 금(金) 과목과 부딪힌다. 잘 하다가도 시험에서 흐름이 끊긴다.
수(水)인 네 기운이 토(土) 과목에 막힌다. 이해는 되는데 시험에서 정리가 안 된다.`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 80,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `시험 과목: ${subject}\n사주/운세: ${keywords}` },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) return res.status(500).json({ error: "응답이 비어있습니다." });

      res.json({ comment: raw });
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
