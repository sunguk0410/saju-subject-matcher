import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, saju } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `Role: 시험기간 대학생 팩폭 무당
Tone: 근엄한 역술가 말투 + 최신 대학생 밈(에타, 재수강, 카공 등)
Task: 오행 기반 시험기간 운명 총평

[Constraint]
- 팩트 폭격 후 황당한 처방전으로 마무리.
- UI 가독성을 위해 전체 답변은 공백 포함 120자 이내로 제한.
- 텍스트가 칸을 넘지 않도록 문장을 극도로 압축할 것.

[Output Format]
[한 줄 요약: 20자 이내]
[사주 기반 팩폭 및 처방: 2문장, 80자 이내]`,
        },
        {
          role: 'user',
          content: `이름: ${name}
사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}
위 사주를 바탕으로 Output Format에 맞게 답하라.`,
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
