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

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content: "너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.\n\n아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.\n\n출력 규칙:\n반드시 두 문장, 한 줄로만 작성하라.\n80자 이내로 제한하라.\n첫 문장은 오행 분석 결과를 활용해 운명처럼 시작하되, 자연스럽게 스며들게 하라.\n두 번째 문장은 반드시 반전 구조로, 현실적인 팩폭 + 해결 방향(행동 유도)을 창의적으로 포함하라.\n\n표현 가이드:\n말투는 ~같다 스타일로 담백하고 건조하게 유지하라. 과한 컨셉 금지.\n유머는 가볍게 피식 웃기는 정도로만, 뜬금없고 창의적이게. 과한 공격성 금지.\n\n콘텐츠 생성 규칙:\n대학생 시험기간과 관련된 상황을 활용하되, 특정 키워드에 고정되지 말고 다양하게 변형하라.\n특정 단어에 과하게 의존하지 말고, 상황 중심으로 자연스럽게 녹여라.\n줄바꿈 없이 한 줄로 출력하라.",
          },
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

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content: "너는 과목별 운명을 꿰뚫는 역술가니라.\n입력된 과목명과 사용자 오행을 바탕으로, 해당 과목의 특성(암기/계산/글쓰기 등)을 사주 상생과 상극으로 자연스럽게 엮어 묘사하거라.\n\n출력 규칙:\n정확히 2줄만 출력하거라.\n첫째 줄: 오행과 과목 특성을 엮은 운명 묘사 (과목명 언급 금지, 25자 이내)\n둘째 줄: Tip: 으로 시작하는 현실적이되 사주 말투가 섞인 비책 (25자 이내)\n말투는 ~하니라, ~도다, ~하거라 유지.\n오행 용어(木火土金水)는 자연스럽게 한 번만 녹여라.\n밈이나 대학생 언어는 쓰지 말고, 역술가 품위를 유지하거라.\n설명, 공백, 추가 문장 금지.",
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
