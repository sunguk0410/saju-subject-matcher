export const SKY = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const EANI = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
export const OM: Record<string, string> = {
  '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수',
  '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화', '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수'
};
export const OHC: Record<string, string> = { '목': 'bg-[#E8F5E9] text-[#2E7D32]', '화': 'bg-[#FFEBEE] text-[#C62828]', '토': 'bg-[#FFF8E1] text-[#E65100]', '금': 'bg-[#ECEFF1] text-[#37474F]', '수': 'bg-[#E3F2FD] text-[#1565C0]' };
export const OHK: Record<string, string> = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

export interface SajuPillar {
  sky: string;
  earth: string;
}

export interface Saju {
  year: SajuPillar;
  month: SajuPillar;
  day: SajuPillar;
  hour: SajuPillar;
  zodiac: string;
}

// 년주: 1864 = 甲子년 기준
export function gY(y: number): SajuPillar {
  return {
    sky: SKY[((y - 1864) % 10 + 10) % 10],
    earth: EARTH[((y - 1864) % 12 + 12) % 12],
  };
}

// 월주: 년간에 따라 월간 결정 (절기 무시 간략 계산)
export function gM(y: number, m: number): SajuPillar {
  const yearStemIdx = ((y - 1864) % 10 + 10) % 10;
  // 甲己년→丙(2), 乙庚년→戊(4), 丙辛년→庚(6), 丁壬년→壬(8), 戊癸년→甲(0)
  const base = (yearStemIdx % 5) * 2 + 2;
  // 월지: 寅(2)=1월 ~ 丑(1)=12월
  const earthIdx = (m + 1) % 12;
  // 월간: 寅월부터 base 시작, m-1번 증가
  const skyIdx = (base + (m - 1)) % 10;
  return { sky: SKY[skyIdx], earth: EARTH[earthIdx] };
}

// 일주: JDN 기반 (1900-01-01 = 甲戌 기준 검증됨)
// 천간 오프셋 +7, 지지 오프셋 +5
export function gD(d: Date): SajuPillar {
  const n = Math.floor(d.getTime() / 86400000);
  return {
    sky: SKY[((n + 7) % 10 + 10) % 10],
    earth: EARTH[((n + 5) % 12 + 12) % 12],
  };
}

// 시주: 일간에 따라 시간 결정
export function gH(daySky: string, h: string): SajuPillar {
  if (h === '') return { sky: SKY[0], earth: EARTH[0] };
  // 시지: 子(0)=23~00시, 丑(1)=01~02시, ...
  const ei = Math.floor(((parseInt(h) + 1) % 24) / 2);
  const dayIdx = SKY.indexOf(daySky);
  // 甲己→甲(0), 乙庚→丙(2), 丙辛→戊(4), 丁壬→庚(6), 戊癸→壬(8)
  const base = (dayIdx % 5) * 2;
  return { sky: SKY[(base + ei * 2) % 10], earth: EARTH[ei] };
}

export function calculateSaju(dateStr: string, hourVal: string): Saju {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const year = gY(y);
  const month = gM(y, m);
  const day = gD(d);
  return {
    year,
    month,
    day,
    hour: gH(day.sky, hourVal),
    // 띠: 2020=쥐(0), 2021=소(1), ..., 2004=원숭이(8)
    zodiac: EANI[((y - 2020) % 12 + 12) % 12],
  };
}

export function getFiveElements(s: Saju) {
  const c: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  ['year', 'month', 'day', 'hour'].forEach(p => {
    const pillar = s[p as keyof Saju] as SajuPillar;
    if (OM[pillar.sky]) c[OM[pillar.sky]]++;
    if (OM[pillar.earth]) c[OM[pillar.earth]]++;
  });
  return c;
}

export const BYEONGMAT_COMMENTS = [
  "이 사주에 따르면 반드시 졸업 학점을 채울 운명입니다. 재수강만 아니라면요.",
  "사주 본다고 성적 오르진 않지만 스트레스는 확실히 올라갑니다.",
  "운명은 노력으로 바꿀 수 있습니다. 지금 이 페이지를 닫으면 됩니다.",
  "당신의 집중력은 붕어와 비슷하군요. 3초 뒤면 이 내용을 잊을 것입니다.",
  "시험지에 이름을 쓰는 순간, 당신의 지식은 로그아웃될 예정입니다.",
  "교수님은 당신의 답안지를 보고 깊은 철학적 고뇌에 빠지실 것입니다. '이게 대체 무슨 소린가' 하고.",
  "족보를 구하려 애쓰지 마세요. 당신이 구한 족보는 이미 작년에 개정되었습니다.",
  "에너지 드링크를 마셔도 몸만 깨어있고 뇌는 이미 퇴근한 상태로군요.",
  "이번 시험의 핵심은 '찍기'입니다. 당신의 직관은 오늘따라 최악이군요.",
  "공부 안 하고 사주 보는 당신의 멘탈, 그것이 바로 진정한 '금(金)'의 기운입니다."
];

export const DISTRACTION_CURSES = [
  "📖 전공 서적을 펼치면 3초 안에 유튜브를 켜게 될지어다.",
  "📱 인스타그램 릴스를 딱 하나만 보려다 1시간이 흐를 것이로다.",
  "💤 도서관 의자가 침대보다 편안하게 느껴지는 마법에 걸렸도다.",
  "🍜 갑자기 야식이 미친 듯이 당겨 공부 흐름이 끊길 것이로다.",
  "🧹 평소엔 안 하던 방 청소가 세상에서 제일 재밌어질 것이로다.",
  "🎮 '딱 한 판만' 하려던 게임이 '딱 한 판 더'로 영원히 이어지리라."
];

export const CLICKBAIT_TITLES = [
  "🚨 [긴급] 이번 기말고사 족보 유출 (실제상황)",
  "🔥 교수님이 수업 시간에 몰래 보던 웹사이트 주소",
  "😱 시험 공부 안 해도 A+ 받는 법 (과학적 증명)",
  "🎁 숭실대 에브리타임에서 난리 난 무료 간식 배부처",
  "🤫 나만 알고 싶은 이번 시험 출제 범위 힌트"
];

export function pick<T>(a: T[], n: number): T {
  return a[((n % a.length) + a.length) % a.length];
}

export function getSajuValue(s: Saju): number {
  return s.year.sky.charCodeAt(0) + s.day.earth.charCodeAt(0);
}
