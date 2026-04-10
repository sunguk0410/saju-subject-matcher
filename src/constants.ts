export const SKY = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const EANI = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];

export const OM: Record<string, string> = {
  '甲': '목', '乙': '목', '丙': '화', '丁': '화', '戊': '토', '己': '토', '庚': '금', '辛': '금', '壬': '수', '癸': '수',
  '子': '수', '丑': '토', '寅': '목', '卯': '목', '辰': '토', '巳': '화', '午': '화', '未': '토', '申': '금', '酉': '금', '戌': '토', '亥': '수',
};
export const OHC: Record<string, string> = {
  '목': 'bg-[#E8F5E9] text-[#2E7D32]', '화': 'bg-[#FFEBEE] text-[#C62828]',
  '토': 'bg-[#FFF8E1] text-[#E65100]', '금': 'bg-[#ECEFF1] text-[#37474F]', '수': 'bg-[#E3F2FD] text-[#1565C0]',
};
export const OHK: Record<string, string> = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
export const OHF: Record<string, string> = {
  '목': '#2E7D32', '화': '#C62828', '토': '#E65100', '금': '#37474F', '수': '#1565C0',
};
export const HOUR_SKY_START: Record<string, number> = {
  '甲': 0, '己': 0,
  '乙': 2, '庚': 2,
  '丙': 4, '辛': 4,
  '丁': 6, '壬': 6,
  '戊': 8, '癸': 8,
};

export interface SajuPillar { sky: string; earth: string; }
export interface Saju {
  year: SajuPillar; month: SajuPillar; day: SajuPillar; hour: SajuPillar;
  zodiac: string;
}

// 12 주요 절기 [월, 일] - 각 월주(月柱)가 시작되는 절기 근사치
// 소한→丑, 입춘→寅(년주 변경), 경칩→卯, 청명→辰, 입하→巳,
// 망종→午, 소서→未, 입추→申, 백로→酉, 한로→戌, 입동→亥, 대설→子
const JEOLGI: [number, number][] = [
  [1, 6], [2, 4], [3, 6], [4, 5], [5, 6], [6, 6],
  [7, 7], [8, 7], [9, 8], [10, 8], [11, 7], [12, 7],
];

// 날짜로 현재 절기 인덱스 구하기 (-1: 소한 이전 = 전년도 子월)
function jeolgiIdx(month: number, day: number): number {
  for (let i = JEOLGI.length - 1; i >= 0; i--) {
    const [jm, jd] = JEOLGI[i];
    if (month > jm || (month === jm && day >= jd)) return i;
  }
  return -1;
}

// 입춘 기준 사주 연도
function sajuYear(y: number, month: number, day: number): number {
  const [im, id] = JEOLGI[1]; // 입춘
  return (month < im || (month === im && day < id)) ? y - 1 : y;
}

function gY(y: number, month: number, day: number): SajuPillar {
  const sy = sajuYear(y, month, day);
  return {
    sky: SKY[((sy - 1864) % 10 + 10) % 10],
    earth: EARTH[((sy - 1864) % 12 + 12) % 12],
  };
}

function gM(y: number, month: number, day: number): SajuPillar {
  const ji = jeolgiIdx(month, day);
  // 지지: 소한(0)→丑(1), 입춘(1)→寅(2), ..., 대설(11)→子(0), 소한이전(-1)→子(0)
  const earthIdx = ji === -1 ? 0 : (ji + 1) % 12;

  // 월간: 사주 연도 년간 기준으로 결정
  const sy = sajuYear(y, month, day);
  const yearSkyIdx = ((sy - 1864) % 10 + 10) % 10;
  // 인월(寅月) 천간 시작: 甲/己년→丙, 乙/庚년→戊, 丙/辛년→庚, 丁/壬년→壬, 戊/癸년→甲
  const 인월SkyIdx = (yearSkyIdx % 5) * 2 + 2;
  // 인월(earthIdx=2)부터 몇 번째 월인지
  const skyIdx = (인월SkyIdx + (earthIdx - 2 + 12) % 12) % 10;

  return { sky: SKY[skyIdx], earth: EARTH[earthIdx] };
}

function gD(d: Date): SajuPillar {
  // 1900-01-01 = 甲戌일 기준: Unix epoch(1970-01-01)은 25567일 후
  // offset sky: 25567 % 10 = 7, offset earth: (25567 + 10) % 12 = 5
  const n = Math.floor(d.getTime() / 86400000);
  return {
    sky: SKY[((n + 7) % 10 + 10) % 10],
    earth: EARTH[((n + 5) % 12 + 12) % 12],
  };
}

function gH(daySky: string, h: string): SajuPillar {
  if (!h) return { sky: SKY[0], earth: EARTH[0] };

  const hour = parseInt(h);
  const ei = Math.floor(((hour + 1) % 24) / 2);
  const startSkyIdx = HOUR_SKY_START[daySky];
  const skyIdx = (startSkyIdx + ei) % 10;

  return {
    sky: SKY[skyIdx],
    earth: EARTH[ei],
  };
}

export function calculateSaju(dateStr: string, hourVal: string): Saju {
  const d = new Date(dateStr);
  // UTC 기준으로 연/월/일 추출 (dateStr은 "YYYY-MM-DD" 형식으로 UTC midnight 파싱)
  const y = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const dayPillar = gD(d);
  return {
    year: gY(y, month, day),
    month: gM(y, month, day),
    day: dayPillar,
    hour: gH(dayPillar.sky, hourVal),
    zodiac: EANI[((sajuYear(y, month, day) - 2020) % 12 + 12) % 12],
  };
}

export function getFiveElements(s: Saju) {
  const c: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  (['year', 'month', 'day', 'hour'] as const).forEach(p => {
    const pillar = s[p] as SajuPillar;
    if (OM[pillar.sky]) c[OM[pillar.sky]]++;
    if (OM[pillar.earth]) c[OM[pillar.earth]]++;
  });
  return c;
}

export function getSajuValue(s: Saju): number {
  return s.year.sky.charCodeAt(0) + s.day.earth.charCodeAt(0);
}

export function pick<T>(a: T[], n: number): T {
  return a[((n % a.length) + a.length) % a.length];
}

export const STUDY_TIPS: [string, string, string][] = [
  ['오행의 기운이 부족할 땐', '초콜릿', '을 섭취하시오.'],
  ['집중력이 떨어지면', '슝슝이', '사진을 보며 반성하시오.'],
  ['가장 확실한 운빨 전략은', '지금 당장 책을 펴는 것', '이오.'],
  ['졸릴 때는', '찬물 세수', '가 최고의 사주 보약이오.'],
  ['공부 전', '핸드폰 뒤집어 놓기', '가 이번 시험 합격의 열쇠이오.'],
  ['에너지가 필요하다면', '아메리카노 한 잔', '이 오행의 기운을 깨울 것이오.'],
  ['암기력 상승에는', '소리 내어 읽기', '가 사주팔자보다 확실하오.'],
  ['두뇌 회전을 높이려면', '10분 산책', '이 어떤 부적보다 효험이 있소.'],
  ['시험 전날 벼락치기보다', '매일 30분 복습', '이 운명을 바꾸는 진짜 비결이오.'],
  ['멍 때리기 전에', '포모도로 25분 타이머', '를 켜는 것이 하늘의 뜻이오.'],
  ['야식은', '시험 끝난 뒤', '에 먹어야 오행이 균형을 이루오.'],
  ['족보보다', '교수님 말씀', '이 더 정확한 출제 예언서이오.'],
];

export const BYEONGMAT_COMMENTS = [
  '이 사주에 따르면 반드시 졸업 학점을 채울 운명입니다. 재수강만 아니라면요.',
  '사주 본다고 성적 오르진 않지만 스트레스는 확실히 올라갑니다.',
  '운명은 노력으로 바꿀 수 있습니다. 지금 이 페이지를 닫으면 됩니다.',
  '당신의 집중력은 붕어와 비슷하군요. 3초 뒤면 이 내용을 잊을 것입니다.',
  '시험지에 이름을 쓰는 순간, 당신의 지식은 로그아웃될 예정입니다.',
  "교수님은 당신의 답안지를 보고 깊은 철학적 고뇌에 빠지실 것입니다. '이게 대체 무슨 소린가' 하고.",
  '족보를 구하려 애쓰지 마세요. 당신이 구한 족보는 이미 작년에 개정되었습니다.',
  '에너지 드링크를 마셔도 몸만 깨어있고 뇌는 이미 퇴근한 상태로군요.',
  "이번 시험의 핵심은 '찍기'입니다. 당신의 직관은 오늘따라 최악이군요.",
  "공부 안 하고 사주 보는 당신의 멘탈, 그것이 바로 진정한 '금(金)'의 기운입니다.",
];

export const DISTRACTION_CURSES = [
  '📖 전공 서적을 펼치면 3초 안에 유튜브를 켜게 될지어다.',
  '📱 인스타그램 릴스를 딱 하나만 보려다 1시간이 흐를 것이로다.',
  '💤 도서관 의자가 침대보다 편안하게 느껴지는 마법에 걸렸도다.',
  '🍜 갑자기 야식이 미친 듯이 당겨 공부 흐름이 끊길 것이로다.',
  '🧹 평소엔 안 하던 방 청소가 세상에서 제일 재밌어질 것이로다.',
  "'딱 한 판만' 하려던 게임이 '딱 한 판 더'로 영원히 이어지리라. 🎮",
];

export const CLICKBAIT_TITLES = [
  '🚨 [긴급] 이번 기말고사 족보 유출 (실제상황)',
  '🔥 교수님이 수업 시간에 몰래 보던 웹사이트 주소',
  '😱 시험 공부 안 해도 A+ 받는 법 (과학적 증명)',
  '🎁 숭실대 에브리타임에서 난리 난 무료 간식 배부처',
  '🤫 나만 알고 싶은 이번 시험 출제 범위 힌트',
];
