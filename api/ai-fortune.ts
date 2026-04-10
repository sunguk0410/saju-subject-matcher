import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'Gemini API Key가 없습니다.' });

  const { name, zodiac, subjects } = req.body;
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `당신은 '슝슝이'라는 이름의 병맛 사주 전문가입니다. 시험기간에 공부는 1도 안 하고 사주나 보는 학생을 위해 인터넷 밈과 유행어를 자연스럽게 섞어서 웃긴 한 문장으로 사주 풀이를 해줘야 합니다. '뇨호호', 'ㄹㅇ', '갓생', '개이득', '각이다', '레전드', '실화냐', '이게 맞냐', '허탈', '탈주각', '망했어요', '반박불가' 같은 표현을 상황에 맞게 활용하세요. 딱 한 문장만, 한국어로 답변하세요.

이름: ${name}, 띠: ${zodiac}, 과목들: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}. 이 학생의 중간고사 운명을 밈 섞어서 웃기고 짧게 한 문장으로 말해줘.`;

    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ fortune: result.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
