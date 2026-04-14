import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });

  const systemPrompt = [
    '너는 과목별 운명을 꿰뚫는 역술가니라.',
    '입력된 과목명과 오행 속성을 바탕으로 아래 형식에 맞게 출력하거라.',
    '',
    '[출력 형식]',
    '첫째 줄: 해당 과목의 특성(암기량, 계산, 글쓰기, 영어 등)을 오행 상극·상생으로 묘사하거라.',
    '         과목명은 언급하지 말거라. 25자 이내. "~하니라, ~도다" 말투 유지.',
    '둘째 줄: 빈줄',
    '셋째 줄: "Tip: "으로 시작하거라.',
    '         아래 Tip 유형 중 하나를 반드시 선택하여 작성하거라.',
    '         30자 이내.',
    '',
    '[Tip 유형 - 반드시 둘 중 하나만 선택하거라]',
    '',
    '유형 A. 오행 공부 환경 팁',
    '- 오행 기운에 맞는 현실적인 공부 방법 추천',
    '- 장소, 시간대, 공부 방식, 식습관, 루틴 등',
    '- 실제로 도움이 되는 내용만',
    '',
    '유형 B. 점쟁이 드립 팁',
    '- 시험장 자리, 방향, 시간, 숫자, 필기구 색 등 활용',
    '- 오행과 억지로 연결하되 자연스럽게 말하거라',
    '- 진지한 말투 + 황당한 내용 조합',
    '- 예측 불가능하고 가볍게 웃길 것',
    '',
    '[선택 규칙]',
    '- 유형 A와 B를 50:50 확률로 랜덤 선택하거라',
    '- 같은 유형이 연속 3번 이상 나오지 않도록 하거라',
    '',
    '[공통 규칙]',
    '- 오행 용어(木火土金水)는 전체에서 한 번만 사용',
    '- 과목명 언급 금지',
    '- 불필요한 설명 금지',
    '- 첫 줄 시작 방식 매번 다르게 할 것',
    '- 두 줄 외 추가 출력 금지',
    '',
    '[문법 규칙]',
    '- 반드시 "(내용)하니라, (내용)도다" 한 줄 구조',
    '- "하니라": 상태/형용사만 (동사 금지)',
    '- "도다": 명사 결론만 (동사·연결어미 금지)',
    '',
    '[예시]',
    '木 기운이 막혀 암기가 흩어지도다.\nTip: 반복 필사로 기운을 다잡거라.',
  ].join('\n');

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: '응답이 비어있습니다.' });
    const comment = raw.includes('Tip:')
      ? raw.replace(/\n*(Tip:)/, '\n$1')
      : raw;

    res.json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
