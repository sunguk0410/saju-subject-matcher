import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // body 안전 파싱 (Vercel 대응)
  const body = typeof req.body === 'string'
    ? JSON.parse(req.body)
    : req.body || {};

  const { name, subjects, saju } = body;

  // 입력값 검증
  if (!name) {
    return res.status(400).json({ error: '이름이 없습니다.' });
  }

  if (!saju?.elements) {
    return res.status(400).json({ error: 'saju 데이터 구조가 잘못되었습니다.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });
  }

  const client = new OpenAI({ apiKey });

  const subjectList = Array.isArray(subjects)
    ? subjects.join(', ')
    : (subjects ?? '없음');

  const s = saju.elements;

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
목${s.wood} 화${s.fire} 토${s.earth} 금${s.metal} 수${s.water}`
        }
      ]
    });

    const fortune = response.choices[0]?.message?.content?.trim();

    if (!fortune) {
      return res.status(500).json({ error: '응답이 비어있습니다.' });
    }

    return res.status(200).json({ fortune });

  } catch (error: any) {
    console.error("OpenAI ERROR:", error);

    return res.status(500).json({
      error: error.message || '서버 에러 발생'
    });
  }
}