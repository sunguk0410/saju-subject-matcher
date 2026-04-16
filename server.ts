import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    console.log("OpenAI API Key 확인됨.");
  } else {
    console.warn("OpenAI API Key 없음. AI 운세 기능이 비활성화됩니다.");
  }

  app.post("/api/ai-fortune", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { name, saju, ohaeng } = req.body;
    if (!name || !saju) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });
    const formatPillar = (p: any) => `${p?.sky ?? ""}${p?.earth ?? ""}`;

    const systemPrompt = [
    '너는 시험기간 대학생들의 운명을 읽는 팩폭 무당이다.',
    '',
    '아래 [오행 결과]를 기반으로 시험기간 상황에 맞게 해석하되, 결과를 직접 설명하지 말고 자연스럽게 녹여라.',
    '',
    '출력 규칙:',
    '반드시 두 문장, 한 줄로만 작성하라.',
    '80자 이내로 제한하라.',
    '첫 문장은 오행 분석 결과를 활용해 운명처럼 시작하되, 자연스럽게 스며들게 하라.',
    '두 번째 문장은 반드시 반전 구조로, 현실적인 팩폭 + 해결 방향(행동 유도)을 창의적으로 포함하라.',
    '',
    '표현 가이드:',
    '말투는 ~같다 스타일로 담백하고 건조하게 유지하라. 과한 컨셉 금지.',
    '유머는 가볍게 피식 웃기는 정도로만, 뜬금없고 창의적이게. 과한 공격성 금지.',
    '',
    '콘텐츠 생성 규칙:',
    '대학생 시험기간과 관련된 상황을 활용하되, 특정 키워드에 고정되지 말고 다양하게 변형하라.',
    '예시 범주: 학습(벼락치기, 집중력 붕괴, 계획 실패), 행동(미루기, 유튜브/넷플릭스 도피, 낮밤 뒤집힘), 환경(도서관, 집, 카페, 강의실), 시스템(과제, 시험, 출결, 재수강, 성적), 커뮤니티(단톡, 자료 공유, 익명 커뮤니티).',
    '연애 요소도 활용하라: 시험기간 중 생기는 썸, 짝사랑, 같은 공간(도서관, 강의실, 카페)에서의 우연한 상황, 공부 핑계로 가까워지는 흐름, 연락, 타이밍, 눈치 보는 상황, 시험 끝나고 흐지부지되는 관계. 단, 연애 요소는 반드시 시험기간 상황과 결합하여 사용하라.',
    '오행 결과를 활용해 장소(도서관, 강의실, 카페 등), 행동(공부 방식 or 머무는 위치), 흐름(그 행동이 연애/관계에 미묘하게 영향을 주는 구조)을 자연스럽게 녹여라.',
    '특정 단어에 과하게 의존하지 말고, 상황 중심으로 자연스럽게 녹여라.',
    '줄바꿈 없이 한 줄로 출력하라.',
    '',
    '[문법 규칙]',
    '- 반드시 "(내용)하니라, (내용)도다" 한 줄 구조',
    '- "하니라": 상태/형용사만 (동사 금지)',
    '- "도다": 명사 결론만 (동사·연결어미 금지)',
    '',
    '[예시]',
    '집중은 되나 오래 못 버티는 흐름이니라, 결국 루틴이 살길이도다.',
    ].join("\n");

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 120,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `이름: ${name}\n사주: 연주 ${formatPillar(saju.year)} / 월주 ${formatPillar(saju.month)} / 일주 ${formatPillar(saju.day)} / 시주 ${formatPillar(saju.hour)}\n[오행 결과] ${ohaeng || "정보 없음"}`,
          },
        ],
      });

      const fortune = response.choices[0]?.message?.content?.trim();
      if (!fortune) return res.status(500).json({ error: "응답이 비어있습니다." });

      res.json({ fortune });
    } catch (error: any) {
      console.error("OpenAI 오류:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  const subjPrompt1 = `너는 장난기 넘치는 역술가니라.
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

  const subjPrompt2 = `아래 운세 원문을 규칙에 맞게 JSON으로 변환하라.
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

  const validateSubj = (json: any, subject: string): string[] => {
    const errors: string[] = [];
    if (!json.front || !json.back || !json.tip) return ["필드 누락"];
    if (!String(json.back).trim().endsWith("이")) errors.push("back 형식");
    const line1 = `${json.front}하니라, ${json.back}도다`;
    if ([...line1].length > 50) errors.push(`1줄 ${[...line1].length}자`);
    if ([...json.tip].length > 60) errors.push(`Tip ${[...json.tip].length}자`);
    if (!String(json.tip).startsWith("Tip: ")) errors.push("Tip 접두어");
    if (String(json.front + json.back + json.tip).includes(subject)) errors.push("과목명 포함");
    const all = `${json.front} ${json.back} ${json.tip}`;
    const count = ["木", "火", "土", "金", "水"].reduce((s, h) => s + (all.split(h).length - 1), 0);
    if (count !== 1) errors.push(`오행 ${count}회`);
    return errors;
  };

  const assembleSubj = (json: { front: string; back: string; tip: string }): string =>
    `${json.front}하니라, ${json.back}도다\n\n${json.tip}`;

  app.post("/api/subj-comment", async (req, res) => {
    if (!apiKey) return res.status(400).json({ error: "OpenAI API Key가 없습니다." });

    const { subject, keywords } = req.body;
    if (!subject || !keywords) return res.status(400).json({ error: "입력값이 부족합니다." });

    const client = new OpenAI({ apiKey });
    const MAX_RETRY = 3;
    let lastJson: any = null;

    try {
      for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
        const step1Res = await client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.9,
          max_tokens: 200,
          messages: [
            { role: "system", content: subjPrompt1 },
            { role: "user", content: `시험 과목: ${subject}\n사주/운세: ${keywords}` },
          ],
        });

        const raw = step1Res.choices[0]?.message?.content?.trim();
        if (!raw) continue;

        const step2Res = await client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 150,
          messages: [
            { role: "system", content: subjPrompt2 },
            { role: "user", content: raw },
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

        const errors = validateSubj(parsed, subject);
        lastJson = parsed;

        if (errors.length === 0) {
          return res.json({ comment: assembleSubj(parsed) });
        }
      }

      if (lastJson) return res.json({ comment: assembleSubj(lastJson) });
      return res.status(500).json({ error: "운세 생성에 실패했습니다." });
    } catch (error: any) {
      console.error("OpenAI 과목 코멘트 오류:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
  });
}

startServer();
