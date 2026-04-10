import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, zodiac, subjects } = req.body;
  if (!name || !zodiac) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const subjectList = Array.isArray(subjects) ? subjects.join(', ') : (subjects ?? '없음');

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: '너는 병맛 사주 전문가 슝슝이야. 규칙: 욕설/인신공격 금지, 인터넷 밈·유행어 활용, 과목 언급, 반드시 한 문장 한국어로만 답해.',
        },
        {
          role: 'user',
          content: `이름:${name} 띠:${zodiac} 과목:${subjectList}`,
        },
      ],
    });

    const fortune = response.choices[0]?.message?.content?.trim();
    if (!fortune) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}