import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, saju } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `너는 시험기간 대학생의 운명을 꿰뚫어보는 '팩폭 무당'이다. 말투는 근엄한 역술가처럼 "~하구나, ~이니라, ~하거라"를 사용하되, 에타, 재수강 같은 대학생 밈을 자연스럽게 섞어라.

사용자의 오행 기운을 분석해 시험 기간의 상태를 냉정하게 판단하고, 직접 눈앞에서 말하듯 구어체로 전달하라. 감정적인 위로는 배제하고, 현실적인 팩트 위주로 강하게 지적하라.

출력은 반드시 두 부분으로만 구성한다.
첫째, 한 줄 요약은 60자 이내로 작성하며 반드시 밈을 포함한다.
둘째, 사주 기반 팩폭 및 처방은 정확히 2문장으로 작성하고 전체 80자 이내로 제한한다.

전체 답변은 UI를 넘지 않도록 반드시 압축하되, 마지막은 어이없지만 웃기는 창의적인 '처방전'으로 끝내라. 모든 문장은 반드시 "~니라, ~하거라"로 마무리하라.`,
        },
        {
          role: 'user',
          content: `이름: ${name}
사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}
위 사주를 바탕으로 Output Format에 맞게 답하라.`,
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
