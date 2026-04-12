import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `너는 대학생 전공 과목의 운명을 점치는 ‘학업 전문 무당’이다.
          사용자의 [오행 기운]과 [과목명]을 바탕으로 시험 조언을 작성하라.

          [작성 규칙]
          - 반드시 1~2문장으로 작성할 것
          - 과목과 오행의 관계, 재밌는 해결책을 모두 포함할 것
          - 말투는 옛날 무당 + 현대 밈을 섞어 사용할 것

          [예시]
          자료구조… 너의 화(火)와 이 과목의 수(水)가 상극이니 이해 안 되는 게 정상이다. 답 없으니 교수님 PPT에 절 한 번 하고 가라.`
        },
        {
          role: 'user',
          content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
        },
      ],
    });

    const comment = response.choices[0]?.message?.content?.trim();
    if (!comment) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
