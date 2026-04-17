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

 const tone =
  (score ?? 50) >= 80 ? '신바람 난 무당 - 하늘이 돕는 천생연분이니 합격의 춤을 추라는 흥겨운 톤' :
  (score ?? 50) >= 60 ? '엄격한 스승 - 기운이 아슬아슬하니 네 정신 수양에 따라 성패가 갈릴 것이라는 경고 톤' :
  '서슬 퍼런 작두 무당 - 기운이 뒤틀려 답안지가 찢길 팔자니 뼈를 깎는 각오를 하라는 팩폭 톤';

  const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행 + 과목 오행 + 관계를 자연스럽게 포함
- 2문장: 시험 상황에서의 결과를 자연스럽게 이어서 설명

Strict:
- "내 오행"과 "과목 오행" 둘 다 반드시 포함할 것
- "상생", "상극"은 가급적 사용하지 말 것
- 설명용 문구 절대 출력하지 말 것
- 추가 문장 절대 금지

[표현 가이드]
- ${tone}
- 말투는 담백하고 건조하게 유지하라.
- "~같다" 사용 금지, 단정적으로 끝내라 (~다).
- 팩폭은 하되 욕설은 금지.

Format:
- 총 2문장, 줄바꿈으로 구분
- 번호, 따옴표, 레이블 없이 본문만 출력

Example:
수(水)인 네 기운이 토(土)에 발목 잡혀 진흙탕에 빠진 꼴이다. 시험지 앞에서 아는 것도 머릿속에서 증발한다.
목(木)인 네 기운이 금(金)의 도끼에 찍히는 형국이다. 열심히 외워도 시험장 들어서는 순간 기억이 나무토막처럼 쪼개진다.`;

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 100,
        temperature: 1.0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `시험 과목: ${subject}\n${keywords}` },
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
