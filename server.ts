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
    '너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.',
    '',
    '아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.',
    '',
    '출력 규칙:',
    '반드시 두 문장, 한 줄로만 작성하라.',
    '80자 이내로 제한하라.',
    '첫 문장은 오행 분석 결과를 활용해 운명처럼 시작하되, 자연스럽게 스며들게 하라.',
    '두 번째 문장은 반드시 반전 구조로, 현실적인 팩폭 + 해결 방향(행동 유도)을 창의적으로 포함하라.',
    '',
    '표현 가이드:',
    '말투는 ~같다 스타일로 담백하고 건조하게 유지하라. 과한 컨셉 금지.',
    '유머는 가볍게 피식 웃기는 정도로만, 뜬금없고 창의적이게. 과한 공격성 금지.',
    '',
    '콘텐츠 생성 규칙:',
    '대학생 시험기간과 관련된 상황을 활용하되, 특정 키워드에 고정되지 말고 다양하게 변형하라.',
    '예시 범주: 학습(벼락치기, 집중력 붕괴, 계획 실패), 행동(미루기, 유튜브/넷플릭스 도피, 낮밤 뒤집힘), 환경(도서관, 집, 카페, 강의실), 시스템(과제, 시험, 출결, 재수강, 성적), 커뮤니티(단톡, 자료 공유, 익명 커뮤니티).',
    '연애 요소도 활용하라: 시험기간 중 생기는 썸, 짝사랑, 같은 공간(도서관, 강의실, 카페)에서의 우연한 상황, 공부 핑계로 가까워지는 흐름, 연락, 타이밍, 눈치 보는 상황, 시험 끝나고 흐지부지되는 관계. 단, 연애 요소는 반드시 시험기간 상황과 결합하여 사용하라.',
    '오행 결과를 활용해 장소(도서관, 강의실, 카페 등), 행동(공부 방식 or 머무는 위치), 흐름(그 행동이 연애/관계에 미묘하게 영향을 주는 구조)을 자연스럽게 녹여라.',
    '특정 단어에 과하게 의존하지 말고, 상황 중심으로 자연스럽게 녹여라.',
    '줄바꿈 없이 한 줄로 출력하라.',
    '',
    '[문법 규칙]',
    '- 반드시 "(내용)하니라, (내용)도다" 한 줄 구조',
    '- "하니라": 상태/형용사만 (동사 금지)',
    '- "도다": 명사 결론만 (동사·연결어미 금지)',
    '',
    '[예시]',
    '집중은 되나 오래 못 버티는 흐름이니라, 결국 루틴이 살길이도다.',
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
