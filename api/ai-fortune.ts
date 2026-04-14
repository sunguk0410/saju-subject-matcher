import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, saju, ohaeng } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  const systemPrompt = [
    `Role: 시험기간 사주를 보는 무당

Task: 사주 오행으로 중간고사 상황을 한 번만 표현하라.

Rules:
- 반드시 2문장만 출력
- 반드시 1개만 생성 (여러 개 금지)
- 1문장: 오행 + 중간고사 상황
- 2문장: 현실적인 결과를 자연스럽게 이어서 마무리

Strict:
- 추가 문장 절대 금지
- 3개 이상 생성 금지
- 문장 끊기지 않게 작성
- 이상한 비유 금지

Style:
- 자연스럽고 짧게
- 현실 대학생 공감
- 가볍게 웃긴 느낌

Format:
[상황 문장]
[결과 문장 + 팔자다]

Example:
목(木)이 잘 자라다가 중간고사에 금(金)으로 잘린다.
공부 쌓아둔 것 같아도 시험날 리셋되는 팔자다.`
  ].join('\n');

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `이름: ${name}\n사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}\n[오행 결과] ${ohaeng || '정보 없음'}`,
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
