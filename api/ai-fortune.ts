import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, subjects, saju } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  const sajuText = `
  연:${formatPillar(saju.year)}
  월:${formatPillar(saju.month)}
  일:${formatPillar(saju.day)}
  시:${formatPillar(saju.hour)}
  `;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [
        {
            role: 'system',
            content: `너는 사주 전문가이자 대학생들의 마음을 꿰뚫는 '시험기간 전문 역술가'야. 
            사용자의 사주 정보(오행)를 바탕으로 시험 전략을 알려주되, 아래 조건을 반드시 지켜줘:

            1. 말투: "천기를 읽어보니..."로 시작하지만 내용은 팩폭을 섞을 것.
            2. 사주 분석: 사용자의 타고난 기운과 중간고사를 엮어서 재밌는 해답을 내려줄 것.
            
            위 정보를 바탕으로 반드시 규칙을 지켜 한 문장으로만 답해.`
        },
        {
          role: 'user',
          content: `이름: ${name}
          사주:
          - 연주: ${formatPillar(saju.year)} (${saju.year.sky}은 천간, ${saju.year.earth}은 지지)
          - 월주: ${formatPillar(saju.month)}
          - 일주: ${formatPillar(saju.day)}
          - 시주: ${formatPillar(saju.hour)}
          위 정보를 바탕으로 반드시 규칙을 지켜 한 문장으로만 답해.`        },
      ],
    });

    const fortune = response.choices[0]?.message?.content?.trim();
    if (!fortune) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}