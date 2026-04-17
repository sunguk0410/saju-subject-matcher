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
`너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.

아래 [오행 결과]를 기반으로 시험기간 상황을 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.

[출력 규칙]
- 반드시 세 문장으로 작성하라.
- 한 줄로 출력하라.
- 글자 수는 150~200자로 작성하라.
- 첫 문장은 오행 흐름 중심으로 “~팔자다 / ~형국이다 / ~흐름이다” 형태로 시작하라.
- 두 번째 문장은 오행 간 상생/상극, 기운의 균형/불균형 등 ‘사주 해석’ 자체에 집중하라.
- 세 번째 문장은 반드시 반전 구조로, 현실적인 시험 결과 + 행동 유도를 포함하라.

[표현 가이드]
- 말투는 담백하고 건조하게 유지하라.
- “~같다” 사용 금지, 단정적으로 끝내라 (~다).
- 과한 컨셉 금지, 대신 해석은 날카롭게 유지하라.
- 팩폭은 하되 욕설은 금지 (가벼운 자극 표현은 허용).

[콘텐츠 규칙]
- 반드시 “중간고사 / 시험지 / 성적 / 공부 방식” 중 하나 이상 포함하라.
- 결과는 “기억 안 남, 머리 하얘짐, 아는 문제 틀림” 등 구체적인 시험 상황으로 드러내라.
- 행동 유도는 반드시 포함하라.

[출력 형식 예시]
水 기운이 흩어지고 火 기운이 들뜨는 불안정한 흐름이다. 집중을 잡아줄 土가 약해 암기는 쌓이지 않고 이해도 겉돈다. 결국 중간고사에서 아는 문제도 틀리니 문제 반복이라도 안 하면 성적은 그대로 박힌다.`
  ].join('\n');

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 250,
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

    const { subject, keywords, score } = req.body;
    if (!subject || !keywords) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });

    const toneGuide = (score ?? 50) >= 80
      ? "- 오행이 잘 맞아 흐름이 좋다. 긍정적이고 힘을 실어주는 톤으로 표현하라."
      : (score ?? 50) >= 60
      ? "- 궁합이 무난하다. 중립적인 톤으로, 노력하면 된다는 뉘앙스로 표현하라."
      : "- 오행이 충돌한다. 팩폭 톤으로, 쉽지 않을 것이라는 현실적인 느낌으로 표현하라.";

    const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행(한자) + 과목 오행(한자) + 관계를 자연스럽게 포함
- 2문장: 과목의 시험 상황에서의 결과를 자연스럽게 이어서 설명

[점수 반영 톤 조절]
${toneGuide}

Strict:
- "내 오행"과 "과목 오행" 둘 다 반드시 포함할 것
- "상생", "상극"은 가급적 사용하지 말 것
- 설명용 문구(예: [시험 상황 결과]) 절대 출력하지 말 것
- 추가 문장 절대 금지

[표현 가이드]
- 말투는 건조하게 유지하라.
- "~같다" 사용 금지, 단정적으로 끝내라 (~다).
- 과한 컨셉 금지, 대신 해석은 날카롭게 웃기게 유지하라.
- 팩폭은 하되 욕설은 금지 (가벼운 자극 표현은 허용).

Format:
첫 문장
두 번째 문장

Example:
木인 네 기운이 金 과목과 부딪힌다. 잘 하다가도 시험에서 흐름이 끊긴다.
水인 네 기운이 土 과목에 막힌다. 이해는 되는데 시험에서 정리가 안 된다.`;

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
