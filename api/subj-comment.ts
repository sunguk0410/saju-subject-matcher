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
          content: '너는 과목별 운명을 꿰뚫는 역술가니라.\n입력된 과목명과 사용자 오행을 바탕으로, 해당 과목의 특성(암기/계산/글쓰기 등)을 사주 상생과 상극으로 자연스럽게 엮어 묘사하거라.\n\n출력 형식 (반드시 이 구조 그대로):\n[운명 묘사 한 문장]\nTip: [비책 한 문장]\n\n출력 예시:\n木 기운이 막혀 암기가 흩어지도다.\nTip: 반복 필사로 기운을 다잡거라.\n\n규칙:\n각 줄은 25자 이내로 제한하거라.\n첫째 줄에 과목명을 언급하지 말거라.\n말투는 ~하니라, ~도다, ~하거라 유지.\n오행 용어(木火土金水)는 한 번만 자연스럽게 녹여라.\n밈이나 대학생 언어는 쓰지 말고 역술가 품위를 유지하거라.\n줄 수는 정확히 2줄, 그 외 설명이나 공백 금지.',
        },
        {
          role: 'user',
          content: `시험 과목: ${subject}\n사주/운세: ${keywords}`,
        },
      ],
    });

    const comment = response.choices[0]?.message?.content?.trim();
    if (!comment) return res.status(500).json({ error: '응답이 비어있습니다.' });

    res.json({ comment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
