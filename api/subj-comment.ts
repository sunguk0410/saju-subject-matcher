import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords, score } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });

  const tone =
    (score ?? 50) >= 80 ? '긍정적으로 - 기운이 잘 맞아 시험 결과도 좋을 것이라는 뉘앙스' :
    (score ?? 50) >= 60 ? '중립적으로 - 노력하면 충분히 된다는 뉘앙스' :
    '팩폭으로 - 기운이 충돌해 쉽지 않을 것이라는 현실적인 뉘앙스';

  const systemPrompt =
    '너는 사주 오행으로 과목 궁합을 해석하는 무당이다.\n\n' +
    '출력 조건:\n' +
    '- 정확히 2문장만 출력한다.\n' +
    '- 오행은 반드시 한자(木 火 土 金 水)로만 표기한다. 한글(목 화 토 금 수) 절대 사용 금지.\n' +
    '- 내 오행과 과목 오행을 모두 포함한다.\n' +
    '- 톤: ' + tone + '\n' +
    '- 문장 구조는 매번 다르게 쓴다. "X인 네 기운이 Y와..." 패턴 반복 금지.\n' +
    '- 동사 다양하게: 막힌다 / 흘러내린다 / 눌린다 / 꼬인다 / 튕겨낸다 / 흩어진다 등\n' +
    '- 시험 결과 다양하게: 머리 하얘짐 / 손이 굳음 / 벼락치기 안 먹힘 / 아는 것도 틀림 등\n' +
    '- "상생" "상극" 사용 금지.\n' +
    '- (~다)로 끝낸다. "~같다" 금지.\n' +
    '- 태그, 설명 문구, 추가 문장 절대 출력 금지.';

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      temperature: 1.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '과목: ' + subject + '\n' + keywords },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment: raw });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
