import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords, score } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });

  const toneGuide = (score ?? 50) >= 80
    ? '- 오행이 잘 맞아 흐름이 좋다. 긍정적이고 힘을 실어주는 톤으로 표현하라.'
    : (score ?? 50) >= 60
    ? '- 궁합이 무난하다. 중립적인 톤으로, 노력하면 된다는 뉘앙스로 표현하라.'
    : '- 오행이 충돌한다. 팩폭 톤으로, 쉽지 않을 것이라는 현실적인 느낌으로 표현하라.';

  const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행 + 과목 오행 + 관계를 자연스럽게 포함
- 2문장: 과목의 시험 상황에서의 결과를 자연스럽게 이어서 설명

[점수 반영 톤 조절]
${toneGuide}

Strict:
- “내 오행”과 “과목 오행” 둘 다 반드시 포함할 것
- “상생”, “상극”은 가급적 사용하지 말 것
- 설명용 문구(예: [시험 상황 결과]) 절대 출력하지 말 것
- 추가 문장 절대 금지

[표현 가이드]
- 말투는 건조하게 유지하라.
- “~같다” 사용 금지, 단정적으로 끝내라 (~다).
- 과한 컨셉 금지, 대신 해석은 날카롭게 웃기게 유지하라.
- 팩폭은 하되 욕설은 금지 (가벼운 자극 표현은 허용).

Format:
첫 문장
두 번째 문장`;

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
