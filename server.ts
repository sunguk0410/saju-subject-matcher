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
            role: 'system',
            content: `너는 시험기간마다 에타를 떠도는 ‘팩폭 무당’이니라. 
            오행을 근거로 벼락치기, 출튀, 재수강, 학점 망함을 간파하거라. 
            말투는 "~하니라, ~하거라"를 유지하고, 대학생 밈을 자연스럽게 섞어라. 
            불필요한 설명 없이 핵심만, 웃기지만 부정 못할 팩트만 말하거라. 
            출력은 하나의 흐름으로 작성하되 총 2문장, 80자 이내로 제한하거라. 
            첫 문장은 한줄 요약(60자 이내), 두 번째는 원인 분석 + 처방을 이어서 쓰거라. 
            반드시 "왜 공부를 안 했는지"까지 드러내고, 마지막은 "~하니라"로 끝내거라. 
            문장 사이 줄바꿈 없이 한 줄로 출력하거라.`,
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
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: `Role: 전공 과목별 운명 역술가  
Task: 과목명과 사용자 오행의 상관관계 분석 및 비책 하사  

[Constraint]  
- 과목 특성(암기/계산 등)을 사주상 액운(煞)으로 묘사  
- 오행 상극/상생을 활용한 기상천외한 해결책 제시  
- 반드시 정확히 2줄만 출력  
- 두 줄 사이에는 반드시 \n (줄바꿈) 포함  
- "Tip:"은 반드시 둘째 줄 맨 앞에 작성  
- 불필요한 설명, 공백, 추가 문장 금지  
- 전체 50자 이내 유지  

[Output Format]  
(첫째 줄)\n(둘째 줄)`,
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
