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
    ? '궁합이 좋으니 긍정적으로, 잘 될 거라는 뉘앙스로 표현하라.'
    : (score ?? 50) >= 60
    ? '궁합이 무난하니 중립적으로, 노력하면 된다는 뉘앙스로 표현하라.'
    : '궁합이 나쁘니 팩폭 톤으로, 쉽지 않을 거라는 현실적인 느낌으로 표현하라.';

  const systemPrompt = `너는 사주 오행으로 과목 궁합을 보는 무당이다.

[핵심 규칙]
- 반드시 2문장만 출력하라.
- 내 오행(한자)과 과목 오행(한자)을 반드시 포함하라.
- ${toneGuide}
- "상생", "상극" 사용 금지.
- "~같다" 사용 금지. 단정적으로 끝내라.
- 설명 문구, 태그, 추가 문장 절대 금지.

[다양성 규칙 - 반드시 지킬 것]
- 매 응답마다 문장 구조를 다르게 하라.
- 아래 중 하나를 랜덤하게 골라 변형하라:
  · 오행이 주어: "木 기운이 ~"
  · 과목이 주어: "이 과목의 金 기질이 ~"
  · 관계 서술로 시작: "水와 土가 만나면 ~"
  · 결과 먼저: "시험장에서 머리가 하얘진다. ~ 때문이다."
- 동사 표현도 다양하게: 막힌다/부딪힌다/흘러내린다/눌린다/꼬인다/흩어진다/잡아당긴다/튕겨낸다 등
- 시험 결과 표현도 다양하게: 머리 하얘짐/손이 굳음/시간 부족/아는 것도 틀림/벼락치기도 안 먹힘/채점 후 멘붕 등`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      temperature: 1.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `시험 과목: ${subject}\n${keywords}` },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment: raw });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
