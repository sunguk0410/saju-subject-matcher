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
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `Role: 전공 과목별 운명 역술가  
Task: 과목명과 사용자 오행의 상관관계 분석 및 비책 하사  

[Constraint]  
- 과목 특성(암기/계산 등)을 사주상 액운(煞)으로 묘사  
- 오행 상극/상생을 활용한 기상천외한 해결책 제시  
- 반드시 정확히 2줄만 출력  
- 두 줄 사이에는 반드시 \n (줄바꿈) 포함  
- "Tip:"은 반드시 둘째 줄 맨 앞에 작성  
- 불필요한 설명, 공백, 추가 문장 금지  
- 전체 50자 이내 유지  

[Output Format]  
(첫째 줄)\n(둘째 줄)`,
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
