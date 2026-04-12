import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { name, subjects, saju } = req.body;
  if (!name || !saju) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const formatPillar = (p: any) => `${p?.sky ?? ''}${p?.earth ?? ''}`;

  const sajuText = `
  연:${formatPillar(saju.year)}
  월:${formatPillar(saju.month)}
  일:${formatPillar(saju.day)}
  시:${formatPillar(saju.hour)}
  `;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 80,
      messages: [
        {
          role: 'system',
          content: `사주 전문가다. 시험기간에 사주 보는 학생을 비웃으면서 천간지지와 오행을 해석해 중간고사 운세를 한 문장으로 예언처럼 출력하라.

          규칙:
          - 반드시 한 문장
          - "~~이로다", "~~이 느껴진다" 말투 사용
          - 비웃는 뉘앙스 포함
          - 오행(목화토금수) 또는 기운/상극/상생 언급
          - 결과는 단정적으로 표현 (망한다, 의미 없다, 늪이다 등)
          - 과목 직접 언급 금지 (이 과목, 해당 과목 등 금지)
          - 응원/긍정 금지
          - 한자 사용 금지

          출력 스타일 예시:
          - 가소로운 집착이로다, 금 기운이 살아 있어 그나마 숨통이 트이는 흐름이 느껴진다.
          - 초과 학기의 기운이로다, 토 기운이 탁해 붙잡을수록 늪이 되어버릴 운명이다.
          - 공부보다 운에 기대는 흐름이로다, 수 기운이 약해 결과는 이미 기울어진 듯하다.`
        },
        {
          role: 'user',
          content: `이름: ${name}
          사주:
          - 연주: ${formatPillar(saju.year)} (${saju.year.sky}은 천간, ${saju.year.earth}은 지지)
          - 월주: ${formatPillar(saju.month)}
          - 일주: ${formatPillar(saju.day)}
          - 시주: ${formatPillar(saju.hour)}
          위 정보를 바탕으로 반드시 규칙을 지켜 한 문장으로만 답해.`        },
      ],
    });

    const fortune = response.choices[0]?.message?.content?.trim();
    if (!fortune) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ fortune });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}