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
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content: `사주 전문가. 시험기간에 사주 보는 학생을 비웃으면서도 천간지지 오행을 해석해 중간고사 운세를 한 문장으로 강렬하게 답해. 한자 사용 금지.`,
          },
          {
            role: 'user',
            content: `이름: ${name}
            사주:
            - 연주: ${formatPillar(saju.year)} (${saju.year.sky}은 천간, ${saju.year.earth}은 지지)
            - 월주: ${formatPillar(saju.month)}
            - 일주: ${formatPillar(saju.day)}
            - 시주: ${formatPillar(saju.hour)}
            시험기간에 사주 보는 학생을 비웃으면서도 천간지지 오행을 해석해 중간고사 운세를 한 문장으로 강렬하게 답해.`,
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
