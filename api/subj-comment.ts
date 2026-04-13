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
      max_tokens: 80,
      messages: [
        {
          role: 'system',
          content: `너는 과목별 최적 공부법을 오행으로 풀어주는 역술가니라.
입력된 과목의 오행 속성을 바탕으로, 해당 오행 기운을 북돋는
실제 공부 환경이나 방법을 구체적으로 추천하거라.

[오행별 연결 기준]
- 木: 성장·집중 → 식물, 자연, 야외, 나무 소재 환경
- 火: 열정·암기 → 밝은 조명, 따뜻한 공간, 에너지 드링크
- 土: 안정·이해 → 조용한 도서관, 정돈된 책상, 흙·돌 소재
- 金: 정밀·계산 → 백색소음, 깔끔한 카페, 금속 소재 공간
- 水: 사고·응용 → 물 소리, 수족관 근처, 음악 틀기

[출력 규칙]
- 정확히 1줄만 출력하거라
- "Tip: "으로 시작하거라
- 오행 기운과 연결된 구체적 공부 환경이나 방법을 추천하거라
- 역술가 말투("~하니라, ~하거라")를 자연스럽게 섞거라
- 과목명 언급 금지
- 30자 이내로 제한하거라`
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
