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
          content: `너는 과목별 운명을 꿰뚫는 역술가니라.
입력된 과목명과 오행 속성을 바탕으로 아래 형식에 맞게 출력하거라.

[출력 형식]
첫째 줄: 해당 과목의 특성(암기량, 계산, 글쓰기, 영어 등)을 오행 상극·상생으로 묘사하거라.
         과목명은 언급하지 말거라. 25자 이내. "~하니라, ~도다" 말투 유지.
둘째 줄: 빈줄
셋째 줄: "Tip: "으로 시작하거라.
         오행 기운을 활용한 현실적인 대학생 공부법을 추천하거라.
         (장소, 시간대, 공부 방식, 식습관, 루틴 등 매번 다양한 요소에서 골라 추천)
         고정된 패턴 없이 매 과목마다 다른 각도로 접근하거라.
         25자 이내. 역술가 말투 자연스럽게 섞거라.

[공통 규칙]
- 오행 용어(木火土金水)는 두 줄 합쳐 한 번만 자연스럽게 녹여라
- 과목명 언급 금지
- 헛소리·억지 비유 금지, 실제 도움 되는 팁만
- 설명·추가 문장 금지
- 첫 줄 시작 방식을 매번 다르게 하거라
  (오행 상태 묘사 / 과목 특성 먼저 / 운명 선언 등 돌아가며 써라)`
        },
        {
          role: 'user',
          content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
        },
      ],
    });

      const raw = response.choices[0]?.message?.content?.trim();
      if (!raw) return res.status(500).json({ error: "응답이 비어있습니다." });
      const comment = raw.includes('Tip:')
        ? raw.replace(/\n*(Tip:)/, '\n$1')
        : raw;

    res.json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
