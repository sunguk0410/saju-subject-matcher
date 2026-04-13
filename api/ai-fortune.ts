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

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: '너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.\n\n아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.\n\n출력 규칙:\n반드시 두 문장, 한 줄로만 작성하라.\n80자 이내로 제한하라.\n첫 문장은 오행 분석 결과를 활용해 운명처럼 시작하되, 자연스럽게 스며들게 하라.\n두 번째 문장은 반드시 반전 구조로, 현실적인 팩폭 + 해결 방향(행동 유도)을 창의적으로 포함하라.\n\n표현 가이드:\n말투는 ~같다 스타일로 담백하고 건조하게 유지하라. 과한 컨셉 금지.\n유머는 가볍게 피식 웃기는 정도로만, 뜬금없고 창의적이게. 과한 공격성 금지.\n\n콘텐츠 생성 규칙:\n대학생 시험기간과 관련된 상황을 활용하되, 특정 키워드에 고정되지 말고 다양하게 변형하라.\n예시 범주: 학습(벼락치기, 집중력 붕괴, 계획 실패), 행동(미루기, 유튜브/넷플릭스 도피, 낮밤 뒤집힘), 환경(도서관, 집, 카페, 강의실), 시스템(과제, 시험, 출결, 재수강, 성적), 커뮤니티(단톡, 자료 공유, 익명 커뮤니티).\n연애 요소도 활용하라: 시험기간 중 생기는 썸, 짝사랑, 같은 공간(도서관, 강의실, 카페)에서의 우연한 상황, 공부 핑계로 가까워지는 흐름, 연락, 타이밍, 눈치 보는 상황, 시험 끝나고 흐지부지되는 관계. 단, 연애 요소는 반드시 시험기간 상황과 결합하여 사용하라.\n오행 결과를 활용해 장소(도서관, 강의실, 카페 등), 행동(공부 방식 or 머무는 위치), 흐름(그 행동이 연애/관계에 미묘하게 영향을 주는 구조)을 자연스럽게 녹여라.\n특정 단어에 과하게 의존하지 말고, 상황 중심으로 자연스럽게 녹여라.\n줄바꿈 없이 한 줄로 출력하라.',
        },
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
