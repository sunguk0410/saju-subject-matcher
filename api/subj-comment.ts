import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });

  const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행 + 과목 오행 + 관계를 자연스럽게 포함
- 2문장: 시험 상황에서의 결과를 자연스럽게 이어서 설명

Strict:
- "내 오행"과 "과목 오행" 둘 다 반드시 포함할 것
- "상생", "상극"은 가급적 사용하지 말 것
- 설명용 문구(예: [시험 상황 결과]) 절대 출력하지 말 것
- 추가 문장 절대 금지

[표현 가이드]
- 말투는 담백하고 건조하게 유지하라.
- “~같다” 사용 금지, 단정적으로 끝내라 (~다).
- 과한 컨셉 금지, 대신 해석은 날카롭게 유지하라.
- 팩폭은 하되 욕설은 금지 (가벼운 자극 표현은 허용).

Format:
첫 문장
두 번째 문장

Example:
목(木)인 네 기운이 금(金) 과목과 부딪힌다. 잘 하다가도 시험에서 흐름이 끊긴다.
수(水)인 네 기운이 토(土) 과목에 막힌다. 이해는 되는데 시험에서 정리가 안 된다.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 80,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `시험 과목: ${subject}\n사주/운세: ${keywords}` },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment: raw });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
