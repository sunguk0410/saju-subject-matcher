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
    console.log("✅ OpenAI API Key 확인됨.");
  } else {
    console.warn("⚠️ OpenAI API Key 없음. AI 운세 기능이 비활성화됩니다.");
  }

  app.post("/api/ai-fortune", async (req, res) => {

    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { name, subjects, saju } = req.body;

    if (!name || !saju) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });
    const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

    const sajuText = `
    연:${formatPillar(saju.year)}
    월:${formatPillar(saju.month)}
    일:${formatPillar(saju.day)}
    시:${formatPillar(saju.hour)}
    `;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: `너는 사주 전문가이자 대학생들의 마음을 꿰뚫는 '시험기간 전문 역술가'야. 
            사용자의 사주 정보(오행)를 바탕으로 시험 전략을 알려주되, 아래 조건을 반드시 지켜줘:

            1. 말투: "천기를 읽어보니..."로 시작하지만 내용은 팩폭을 섞을 것.
            2. 사주 분석: 사용자의 타고난 기운과 중간고사를 엮어서 재밌는 해답을 내려줄 것.
            
            위 정보를 바탕으로 반드시 규칙을 지켜 한 문장으로만 답해.`
          },
          {
            role: 'user',
            content: `이름: ${name}
            사주:
            - 연주: ${formatPillar(saju.year)} (${saju.year.sky}은 천간, ${saju.year.earth}은 지지)
            - 월주: ${formatPillar(saju.month)}
            - 일주: ${formatPillar(saju.day)}
            - 시주: ${formatPillar(saju.hour)}
            위 정보를 바탕으로 반드시 규칙을 지켜 한 문장으로만 답해.`          },
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

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        messages: [
          {
            role: 'system',
            content: `너는 대학생 전공 과목의 운명을 점치는 ‘학업 전문 무당’이다.
            사용자의 [오행 기운]과 [과목명]을 바탕으로 시험 조언을 작성하라.

            [작성 규칙]
            - 반드시 1~2문장으로 작성할 것
            - 과목과 오행의 관계, 재밌는 해결책을 모두 포함할 것
            - 말투는 옛날 무당 + 현대 밈을 섞어 사용할 것

            [예시]
            자료구조… 너의 화(火)와 이 과목의 수(水)가 상극이니 이해 안 되는 게 정상이다. 답 없으니 교수님 PPT에 절 한 번 하고 가라.`
          },
          {
            role: 'user',
            content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
          },
        ],
      });

      const comment = response.choices[0]?.message?.content?.trim();
      if (!comment) return res.status(500).json({ error: "응답이 비어있습니다." });

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
