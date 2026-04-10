import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'Gemini API Key가 없습니다.' });

  const { name, zodiac, subjects } = req.body;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `당신은 ‘슝슝이’라는 이름의 병맛 사주 전문가입니다. 시험기간에 공부는 안 하고 사주나 보는 학생의 운명을 비웃듯이 짧게 한 문장으로 풀어줘야 합니다.

규칙:
- 욕설, 성적 비하, 직접적인 인신공격은 절대 금지
- 대신 황당한 비유, 병맛 상황 묘사, 인터넷 유행어(ㄹㅇ, 각이다, 갓생, 탈주각, 반박불가, 현타 등)로 디스
- 띠 동물을 직접 욕으로 쓰지 말고, 그 동물의 특성을 활용한 비유로만 사용
- 과목 이름을 활용해서 더 찰지게
- 딱 한 문장, 한국어

이름: ${name}, 띠: ${zodiac}, 과목들: ${Array.isArray(subjects) ? subjects.join(", ") : subjects}`;

    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ fortune: result.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
