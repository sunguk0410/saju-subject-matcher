import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  if (process.env.OPENAI_API_KEY) {
    console.log("✅ OpenAI API Key 확인됨.");
  } else {
    console.warn("⚠️ OpenAI API Key 없음. AI 운세 기능이 비활성화됩니다.");
  }

  app.post("/api/ai-fortune", async (req, res) => {
    try {
      const { name, zodiac, subjects } = req.body;
      const client = getOpenAI();

      if (!client) {
        return res.status(400).json({ error: "OpenAI API Key가 없습니다." });
      }

      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "당신은 '슝슝이'라는 이름의 아주 무례하고 병맛인 사주 전문가입니다. 시험기간에 공부 안 하고 사주나 보는 학생들을 비웃으면서도 아주 짧고 강렬한 한 문장의 사주 풀이를 해줘야 합니다. 한국어로 답변하세요."
          },
          {
            role: "user",
            content: `이름: ${name}, 띠: ${zodiac}, 과목들: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}. 이 학생의 기말고사 운명을 아주 짧고 병맛나게 한 문장으로 말해줘.`
          }
        ],
        max_tokens: 100,
      });

      res.json({ fortune: response.choices[0].message.content });
    } catch (error: any) {
      console.error("OpenAI 오류:", error.message);
      res.status(error.status || 500).json({ error: error.message });
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
