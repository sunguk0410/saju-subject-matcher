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
- 운명/기운/상극/상생 표현 사용
- 운명론적이고 직관적인 해석
- 설명 없이 결과만
- 단호·냉소·신비로운 말투
- 필요 시 오행(목화토금수) 언급 + 간단한 수치(%, +n%)로 재미 요소 추가

예시:
- 상극입니다, 이 과목은 버리는 것이 낫습니다.
- 무난한 흐름입니다, 노력은 배신하지 않습니다.
- 부족한 토를 채워줍니다, 벼락치기 효율 +27%입니다.`,
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
