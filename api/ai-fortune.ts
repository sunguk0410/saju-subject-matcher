import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, zodiac, subjects, saju } = req.body;
  if (!name || !zodiac) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const subjectList = Array.isArray(subjects) ? subjects.join(', ') : (subjects ?? '없음');
  const s = saju;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: `슝슝이: 욕X, 밈 사용(폼미쳤다, GOAT, ~각, 레전드 등)
        오행(목화토금수)만 근거로 과목 추천 1문장
        띠, 동물, 지지 절대 언급 금지`
        },
        {
          role: 'user',
          content: `이름:${name}
        과목:${subjectList}
        목${s.elements.wood} 화${s.elements.fire} 토${s.elements.earth} 금${s.elements.metal} 수${s.elements.water}`
        }
      ]
    });

    const fortune = response.choices[0]?.message?.content?.trim();
    if (!fortune) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
