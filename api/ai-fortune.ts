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

  const systemPrompt = [
    '너는 시험기간 대학생들의 운명을 읽는 건조한 팩폭 무당이다.',
    '',
    '아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되,',
    '결과를 직접 설명하지 말고 자연스럽게 녹여라.',
    '',
    '[출력 형식]',
    '반드시 한 줄, 두 문장으로만 작성하라.',
    '(내용)하니라, (내용)도다.',
    '80자 이내.',
    '',
    '[구성]',
    '- 첫 문장: 오행 흐름을 시험기간 상황에 스며들게 표현 (공부, 환경, 연애 등)',
    '- 두 번째 문장: 반전 구조의 팩폭 + 현실적인 행동 방향',
    '',
    '[표현 가이드]',
    '- 말투는 담백하고 건조하게 (~같다 느낌)',
    '- 가볍게 피식 웃기는 현실 기반 유머',
    '- 과한 컨셉, 억지 비유 금지',
    '',
    '[콘텐츠 범위]',
    '- 학습: 벼락치기, 집중력 붕괴, 계획 실패',
    '- 행동: 미루기, 유튜브/넷플릭스 도피, 낮밤 뒤집힘',
    '- 환경: 도서관, 집, 카페, 강의실',
    '- 시스템: 과제, 시험, 출결, 재수강, 성적',
    '- 연애: 시험기간 썸, 짝사랑, 같은 공간, 공부 핑계 접근, 시험 후 흐지부지',
    '→ 위 요소들을 상황 중심으로 자연스럽게 녹여라',
    '',
    '[문법 규칙]',
    '- 반드시 "(내용)하니라, (내용)도다" 한 줄 구조',
    '- "하니라": 상태/형용사만 (동사 금지)',
    '- "도다": 명사 결론만 (동사·연결어미 금지)',
    '',
    '[금지]',
    '- 오행 결과 직접 설명',
    '- 문장 추가',
    '- 형식 변형',
    '',
    '[예시]',
    '집중은 되나 오래 못 버티는 흐름이니라, 결국 루틴이 살길이도다.',
  ].join('\n');

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
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
