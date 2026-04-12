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

    const { name, saju } = req.body;
    if (!name || !saju) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });
    const formatPillar = (p: any) => `${p?.sky ?? ""}${p?.earth ?? ""}`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 150,
        messages: [
          {
            role: "system",
            content: `Role: 시험기간 대학생 팩폭 무당
Tone: 근엄한 역술가 말투 + 최신 대학생 밈(에타, 재수강, 카공 등)
Task: 오행 기반 시험기간 운명 총평

[Constraint]
- 팩트 폭격 후 황당한 처방전으로 마무리.
- UI 가독성을 위해 전체 답변은 공백 포함 120자 이내로 제한.
- 텍스트가 칸을 넘지 않도록 문장을 극도로 압축할 것.

[Output Format]
[한 줄 요약: 20자 이내]
[사주 기반 팩폭 및 처방: 2문장, 80자 이내]`,
          },
          {
            role: "user",
            content: `이름: ${name}
사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}
위 사주를 바탕으로 Output Format에 맞게 답하라.`,
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

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content: `Role: 전공 과목별 운명 역술가
Task: 과목명과 사용자 오행의 상관관계 분석 및 비책 하사

[Constraint]
- 과목 특성(암기/계산 등)을 사주상 액운(煞)으로 묘사.
- 오행 상극/상생을 활용한 기상천외한 해결책 제시.
- 반드시 한 줄로만 출력하며, 50자를 넘지 말 것.

[Output Format]
[병맛 해결책 한 줄]`,
          },
          {
            role: "user",
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
