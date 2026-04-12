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

  app.post("/api/subj-comment", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { subject, keywords } = req.body;
    if (!subject || !keywords) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 60,
        messages: [
          {
            role: 'system',
            content: `너는 사주 기반으로 시험 과목과 운의 궁합을 해석하는 전문가다.
            \n[시험 과목], [사주/운세]를 보고 시험 공부 조언을 "한 문장"으로 출력하라.
            규칙:
            - 한 문장만 출력
            - 운명/기운/상극/상생 표현 사용
            - 운명론적이고 직관적인 해석
            - 설명 없이 결과만
            - 단호·냉소·신비로운 말투
            - 필요 시 오행(목화토금수) 언급 + 간단한 수치(%, +n%)로 재미 요소 추가

            예시:
            - 상극입니다, 이 과목은 버리는 것이 낫습니다.
            - 무난한 흐름입니다, 노력은 배신하지 않습니다.
            - 부족한 토를 채워줍니다, 벼락치기 효율 +27%입니다.`,
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
