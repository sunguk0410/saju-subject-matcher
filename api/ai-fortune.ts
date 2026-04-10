import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'Gemini API Key가 없습니다.' });

  const { name, zodiac, subjects } = req.body;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  try {
    const prompt = `당신은 '슝슝이'라는 이름의 아주 무례하고 병맛인 사주 전문가입니다. 시험기간에 공부 안 하고 사주나 보는 학생들을 비웃으면서도 아주 짧고 강렬한 한 문장의 사주 풀이를 해줘야 합니다. 한국어로 답변하세요.

이름: ${name}, 띠: ${zodiac}, 과목들: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}. 이 학생의 기말고사 운명을 아주 짧고 병맛나게 한 문장으로 말해줘.`;

    const result = await model.generateContent(prompt);
    const fortune = result.response.text();
    res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
