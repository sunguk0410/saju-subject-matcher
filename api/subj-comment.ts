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
      max_tokens: 60,
      messages: [
        {
          role: 'system',
          content: `너는 사주 기반으로 시험 과목과 운의 궁합을 해석하는 전문가다.
          [시험 과목], [사주/운세]를 보고 시험 공부 조언을 "한 문장"으로 출력하라.

          규칙:
          - 한 문장만 출력
          - 운명/기운/상극/상생/오행 표현 사용
          - 운명론적이고 직관적인 해석
          - 설명 없이 결과만
          - 단호·냉소·신비로운 말투
          - 필요 시 오행 + 간단한 수치(%)
          - 매번 다른 표현과 문장 구조 사용 (같은 패턴 반복 금지)

          출력 스타일 예시:
          - 기운이 어긋났다, 붙잡을수록 늪이 깊어지는 흐름이다.
          - 묘하게 상생하는 기세다, 손대는 만큼은 건져 올릴 수 있다.
          - 토가 비어 있어 중심이 흔들린다, 벼락치기 효율 +18%.
          - 운이 비웃고 있다, 애써도 손에 남는 것이 적을 것이다.
          - 흐름이 기묘하게 이어진다, 최소한의 투자로도 숨통은 트인다.`
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
