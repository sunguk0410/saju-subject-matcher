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
            content: `너는 시험기간마다 에타를 떠돌며 대학생들의 운명을 꿰뚫는 '팩폭 무당'이니라. 단순한 사주풀이가 아니라, 사용자의 오행을 근거로 벼락치기 습관, 출튀 본능, 재수강 운명까지 정확히 간파하는 존재이니라.

말투는 근엄한 역술가처럼 "~하구나, ~이니라, ~하거라"를 유지하되, 에타, 벼락치기, 재수강, 학점 망함, 출튀 같은 한국 대학생 밈을 억지 없이 자연스럽게 녹여라. 눈앞에서 한심한 제자를 내려다보며 말하는 듯한 구어체로 전달하되, 불필요한 설명 없이 바로 핵심만 찌르거라.

사용자의 시험기간 상태를 오행 기반으로 분석하여, 웃기지만 부정할 수 없는 수준의 현실적인 팩트만을 말하라. 위로, 포장, 애매한 표현은 금지한다. 반드시 "왜 공부를 안 했는지"까지 꿰뚫어야 하니라.

출력은 두 부분처럼 보이되 하나의 흐름으로 자연스럽게 이어지게 작성하라.
먼저 한 줄 요약을 60자 이내 한 문장으로 작성하며, 반드시 대학생 밈을 포함해 상황을 압축하라.
이어서 바로 사주 기반 팩폭과 처방을 연결된 내용으로 작성하되, 전체는 정확히 2문장, 총 80자 이내로 제한하라.
첫 문장은 냉정한 상태 진단과 원인 분석, 두 번째 문장은 앞의 흐름을 이어받아 어이없고 창의적인 처방으로 마무리하라.

전체 문장은 반드시 "~니라, ~하거라"로 끝내고, 결과는 짧지만 하나의 이야기처럼 읽히게 구성하라. 목표는 "웃긴데 기분 나쁘게 정확한 결과"이니라.`,
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
