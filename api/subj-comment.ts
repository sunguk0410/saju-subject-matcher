import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const prompt1 = `너는 장난기 넘치는 역술가니라.
과목의 공부 특성을 오행에 빗대어 아래 3가지를 자유롭게 써라.

1) 해당 과목의 핵심 공부 특성 키워드 2개 (예: 계산, 실수)
2) 그 특성을 오행 상극·상생에 빗댄 운세 한 줄 (고어체, 자연스럽게)
3) 팁 한 줄: 아래 A 또는 B 중 택1
   A) 과목에 맞는 현실적 공부법을 오행에 연결 (장소, 시간대, 방식, 루틴 등)
   B) 진지한 말투로 황당한 미신 드립 (빨간 팬티, 시험지 냄새 맡기, 답 찍기 방향, 연필 굴리기, 지우개 안 가져가기 등)

규칙:
- 과목명 직접 언급 금지
- 오행 한자(木火土金水) 한 번만 사용 (팁에서만)
- 운세와 팁 합쳐서 과목 특성이 확실히 드러나야 함. 아무 과목에나 붙일 수 있는 범용 표현 금지.
- 위 3가지만 출력. 다른 설명 금지.`;

const prompt2 = `아래 운세 원문을 규칙에 맞게 JSON으로 변환하라.
설명 없이 JSON만 출력.

[문법 규칙 - "하니라, 도다" 두 절 구조]
조립 공식: front + "하니라, " + back + "도다"
- front: "~하니라" 앞에 올 부분. 반드시 형용사로 끝남.
- back: "~도다" 앞에 올 부분. 반드시 "명사+이/가 명사+이"로 끝남.

[글자수 제한]
- front + "하니라, " + back + "도다" 합쳐서 50자 이내
- tip은 "Tip: " 포함 60자 이내

[올바른 변환 예시]
원문: 셈은 매섭건만 끗발이 약하니, 정밀함이야말로 관건이로다
→ {"front":"셈이 매서우나 끗발이 약","back":"정밀함이 관건이","tip":"Tip: 金 기운에 4번 답 세 번 찍으면 길하니라"}

원문: 갈래가 넓건만 뿌리가 흐리하니, 반복이야 살 길이로다
→ {"front":"갈래 넓으나 뿌리가 흐리","back":"반복이 살 길이","tip":"Tip: 水 기운 따라 밤 10시 듣기부터 시작하거라"}

원문: 박자는 뜨겁건만 손목이 굳었으니, 리듬이 곧 전부로다
→ {"front":"박이 뜨거우나 손목이 뻣뻣","back":"리듬이 전부이","tip":"Tip: 火 기운에 스틱 돌려 3바퀴면 신기 깃드니라"}

[금지]
❌ front가 동사로 끝남 (흩어지, 넘치, 끊기)
❌ back이 동사나 형용사로 끝남
❌ back이 "이"로 안 끝남
❌ 50자 초과`;

function validate(json: any, subject: string): string[] {
  const errors: string[] = [];

  if (!json.front || !json.back || !json.tip) return ['필드 누락'];

  const back = String(json.back).trim();
  if (!back.endsWith('이')) errors.push('back 형식');

  const line1 = `${json.front}하니라, ${json.back}도다`;
  if ([...line1].length > 50) errors.push(`1줄 ${[...line1].length}자`);

  if ([...json.tip].length > 60) errors.push(`Tip ${[...json.tip].length}자`);

  if (!String(json.tip).startsWith('Tip: ')) errors.push('Tip 접두어');

  const all = `${json.front} ${json.back} ${json.tip}`;
  if (all.includes(subject)) errors.push('과목명 포함');

  const count = ['木', '火', '土', '金', '水'].reduce(
    (s, h) => s + (all.split(h).length - 1), 0
  );
  if (count !== 1) errors.push(`오행 ${count}회`);

  return errors;
}

function assemble(json: { front: string; back: string; tip: string }): string {
  return `${json.front}하니라, ${json.back}도다\n\n${json.tip}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'OpenAI API Key가 없습니다.' });

  const { subject, keywords } = req.body;
  if (!subject || !keywords) return res.status(400).json({ error: '입력값이 부족합니다.' });

  const client = new OpenAI({ apiKey });
  const MAX_RETRY = 3;

  let lastJson: any = null;

  try {
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      // Step 1: 과목 특성 기반 운세 원문 생성
      const step1Res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.9,
        max_tokens: 200,
        messages: [
          { role: 'system', content: prompt1 },
          { role: 'user', content: `시험 과목: ${subject}\n사주/운세: ${keywords}` },
        ],
      });

      const raw = step1Res.choices[0]?.message?.content?.trim();
      if (!raw) continue;

      // Step 2: 원문을 문법 규칙에 맞는 JSON으로 변환
      const step2Res = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 150,
        messages: [
          { role: 'system', content: prompt2 },
          { role: 'user', content: raw },
        ],
      });

      const jsonStr = step2Res.choices[0]?.message?.content?.trim();
      if (!jsonStr) continue;

      let parsed: any;
      try {
        const match = jsonStr.match(/\{[\s\S]*\}/);
        if (!match) continue;
        parsed = JSON.parse(match[0]);
      } catch {
        continue;
      }

      const errors = validate(parsed, subject);
      lastJson = parsed;

      if (errors.length === 0) {
        return res.json({ comment: assemble(parsed) });
      }
      // 검증 실패 시 재시도
    }

    // 재시도 소진 - 마지막 결과라도 반환
    if (lastJson) {
      return res.json({ comment: assemble(lastJson) });
    }

    return res.status(500).json({ error: '운세 생성에 실패했습니다.' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
