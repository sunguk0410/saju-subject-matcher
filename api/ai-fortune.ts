import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, saju, ohaeng } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  const systemPrompt = `너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.

아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.

[출력 규칙]
- 반드시 세 문장으로 작성하라.
- 한 줄로 이어서 출력하라. (줄바꿈 없음)
- 글자 수는 반드시 100~130자 사이로 작성하라. 짧으면 안 된다.
- 첫 문장: 오행 흐름을 바탕으로 "~팔자다 / ~형국이다 / ~흐름이다"처럼 운명적으로 시작하라.
- 두 번째 문장: 시험 현실을 구체적으로 팩폭하라. (기억 안 남, 머리 하얘짐, 집중 붕괴 등)
- 세 번째 문장: 반드시 반전 구조로 행동 유도를 포함하라.

[표현 가이드]
- 말투는 담백하고 건조하게 유지하되, 과하게 컨셉 잡지 말 것
- "~같다" 남발 금지, 대신 단정적으로 끝내라 (~다)
- 팩폭은 하되 과한 욕설은 금지 (단, 가볍게 자극적인 표현은 허용)

[콘텐츠 규칙]
- 반드시 "중간고사 / 시험지 / 성적 / 공부 방식" 중 하나 이상 포함
- 결과는 "기억 안 남, 머리 하얘짐, 아는 문제 틀림" 같은 시험 상황으로 구체화
- 행동 유도는 반드시 포함 (문제 풀이, 반복, 암기 등)

[출력 형식 예시]
토 기운이 눌러 기억이 흩어지는 팔자다. 중간고사 시험지 앞에서 다 아는 문제도 하얘지는 형국이다. 결국 반복하지 않으면 그대로 털린다.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 180,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `이름: ${name}\n사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}\n[오행 결과] ${ohaeng || '정보 없음'}`,
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
