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
  '1줄: 해당 과목의 특성(암기량, 계산, 글쓰기, 영어 등)을 오행 상극·상생으로 묘사하거라.',
  '     과목명은 언급하지 말거라. 25자 이내.',
  '2줄: 빈 줄',
  '3줄: "Tip: "으로 시작하거라. 아래 Tip 유형 중 하나를 반드시 선택하여 작성하거라. 30자 이내.',
  '출력은 정확히 이 3줄 구조만 허용하거라. 추가 출력 금지.',
  '',
  '[문법 규칙]',
  '- 1줄은 반드시"(내용)하니라, (내용)도다" 두 절 구조',
  '- "하니라" 앞: 형용사만. "도다" 앞: 명사만.',
  '',
  '[잘못된 문법 예시 - 절대 금지]',
  '암기가 흩어지도다.', '소통도다.', '창의가 넘치고도다.',
  '[Tip 유형 - 유형 A와 유형 B 중 하나만 선택하거라]',
  '',
  '유형 A. 오행 공부 환경 팁',
  '- 오행 기운에 맞는 현실적인 공부 방법 추천',
  '- 장소, 시간대, 공부 방식, 식습관, 루틴 등',
 
  '',
  '유형 B. 점쟁이 드립 팁',
  '- 시험장 자리, 방향, 시간, 숫자, 필기구 색 등 활용',
  '- 진지한 말투 + 오행과 연결된 황당한 내용 조합으로 웃길 것',
  '',
  '[공통 규칙]',
  '- 오행 용어(木火土金水)는 전체에서 한 번만 사용',
  '- 과목명 언급 금지',
  '- 1줄 시작 방식 매번 다르게 할 것',
  '',
  '[올바른 예시]',
  '# 유형 A',
  'Tip: 金 기운이 날카로우나 흐름이 약하니라, 정밀함이 관건이도다.',
  'Tip: 火 기운이 넘치나 지속이 어렵하니라, 집중이 승부수도다.',
  '# 유형 B',
  'Tip: 金 기운이 도우니 왼쪽 끝 자리가 길하니라',
  'Tip: 火 기운이 강하니 오늘은 빨간 펜으로 찍어라',
  "Tip: 木이 솟는 아침, 3번 찍으면 정기가 깃드니라",
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
