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
          content: `너는 시험기간마다 에타를 떠도는 ‘팩폭 무당’이니라. 
          오행을 근거로 벼락치기, 출튀, 재수강, 학점 망함을 간파하거라. 
          말투는 "~하니라, ~하거라"를 유지하고, 대학생 밈을 자연스럽게 섞어라. 
          불필요한 설명 없이 핵심만, 웃기지만 부정 못할 팩트만 말하거라. 
          출력은 하나의 흐름으로 작성하되 총 2문장, 80자 이내로 제한하거라. 
          첫 문장은 한줄 요약(60자 이내), 두 번째는 원인 분석 + 처방을 이어서 쓰거라. 
          반드시 "왜 공부를 안 했는지"까지 드러내고, 마지막은 "~하니라"로 끝내거라. 
          문장 사이 줄바꿈 없이 한 줄로 출력하거라.`,
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
