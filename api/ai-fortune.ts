import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const is503 = (e: any) =>
  e?.status === 503 ||
  String(e?.message).includes('503') ||
  String(e?.message).includes('UNAVAILABLE') ||
  String(e?.message).includes('high demand');

async function callWithRetry(
  ai: GoogleGenAI,
  model: string,
  contents: string,
  attempts: number
): Promise<string> {
  try {
    const result = await ai.models.generateContent({
      model,
      contents,
      config: { maxOutputTokens: 120 },
    });
    const text = result.text?.trim();
    if (!text) throw new Error('empty response');
    return text;
  } catch (e: any) {
    if (attempts > 1 && is503(e)) {
      await new Promise(r => setTimeout(r, 800));
      return callWithRetry(ai, model, contents, attempts - 1);
    }
    throw e;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'Gemini API Key가 없습니다.' });

  const { name, zodiac, subjects } = req.body;
  if (!name || !zodiac) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const ai = new GoogleGenAI({ apiKey });
  const subjectList = Array.isArray(subjects) ? subjects.join(', ') : (subjects ?? '');

  const prompt = `병맛 사주 전문가 슝슝이. 규칙: 욕설 금지, 인터넷 밈/유행어 활용, 띠 특성 비유 사용, 과목 언급, 한 문장 한국어.\n이름:${name} 띠:${zodiac} 과목:${subjectList}`;

  try {
    // 1단계: flash-lite 최대 3회
    try {
      const fortune = await callWithRetry(ai, 'gemini-2.0-flash-lite', prompt, 3);
      return res.json({ fortune });
    } catch (liteErr: any) {
      if (!is503(liteErr)) throw liteErr;
    }

    // 2단계: flash 최대 2회 (lite 503 연속 실패 시)
    const fortune = await callWithRetry(ai, 'gemini-2.0-flash', prompt, 2);
    return res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
