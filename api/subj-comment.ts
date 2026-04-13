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
          content: '너는 과목별 운명을 꿰뚫는 역술가니라.\n입력된 과목명과 사용자 오행을 바탕으로, 해당 과목의 특성(암기/계산/글쓰기 등)을 사주 상생과 상극으로 자연스럽게 엮어 묘사하거라.\n\n출력 규칙:\n정확히 2줄만 출력하거라.\n첫째 줄: 오행과 과목 특성을 엮은 운명 묘사 (과목명 언급 금지, 25자 이내)\n둘째 줄: 비책 내용을 먼저 쓰고 한 칸 띄운 후 Tip: 을 붙여라. 형식: [비책내용] Tip: (비책 25자 이내)\n말투는 ~하니라, ~도다, ~하거라 유지.\n오행 용어(木火土金水)는 자연스럽게 한 번만 녹여라.\n밈이나 대학생 언어는 쓰지 말고, 역술가 품위를 유지하거라.\n설명, 공백, 추가 문장 금지.',
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
