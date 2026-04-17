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
  (score ?? 50) >= 80 ? '신바람 난 무당 - 하늘이 돕는 천생연분이니 합격의 춤을 추라는 흥겨운 톤' :
  (score ?? 50) >= 60 ? '엄격한 스승 - 기운이 아슬아슬하니 네 정신 수양에 따라 성패가 갈릴 것이라는 경고 톤' :
  '서슬 퍼런 작두 무당 - 기운이 뒤틀려 답안지가 찢길 팔자니 뼈를 깎는 각오를 하라는 팩폭 톤';

  const systemPrompt = `Role: 과목과 사주 궁합을 보는 무당

Task: 사용자의 오행과 과목의 오행을 연결해 궁합을 해석하라.

Rules:
- 반드시 2문장으로만 작성
- 1문장: 내 오행 + 과목 오행 + 관계를 자연스럽게 포함
- 2문장: 시험 상황에서의 결과를 자연스럽게 이어서 설명

Strict:
- "내 오행"과 "과목 오행" 둘 다 반드시 포함할 것
- "상생", "상극"은 가급적 사용하지 말 것
- 설명용 문구 절대 출력하지 말 것
- 추가 문장 절대 금지

[표현 가이드]
- ${tone}
- 말투는 담백하고 건조하게 유지하라.
- "~같다" 사용 금지, 단정적으로 끝내라 (~다).
- 팩폭은 하되 욕설은 금지.

Format:
- 총 2문장, 줄바꿈으로 구분
- 번호, 따옴표, 레이블 없이 본문만 출력

Example:
수(水)인 네 기운이 토(土)에 발목 잡혀 진흙탕에 빠진 꼴이다. 시험지 앞에서 아는 것도 머릿속에서 증발한다.
목(木)인 네 기운이 금(金)의 도끼에 찍히는 형국이다. 열심히 외워도 시험장 들어서는 순간 기억이 나무토막처럼 쪼개진다.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      temperature: 1.0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `과목: ${subject}\n내 오행 분포: ${keywords}\n궁합 점수: ${score}점` },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment: raw });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
