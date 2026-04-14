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
  '전공 서적 펼치고 3초 안에 유튜브를 켜게 되리라.',
  '인스타 릴스를 딱 하나만 보려다 1시간이 증발하리라.',
  '도서관 의자가 침대보다 편안하게 느껴지는 저주에 걸리리라.',
  '갑자기 야식이 미친 듯이 당겨 공부 흐름이 끊기리라.',
  '평소엔 손도 안 대던 방 청소가 세상에서 제일 급해지리라.',
  "딱 한 판만 하려던 게임이 새벽 4시까지 이어지리라.",
];

export const CLICKBAIT_TITLES = [
  '야 미쳤다 교수님 시험지 폴더 유출됐대;; 지금 당장 ㄱㄱ',
  '학생회가 시험기간 무료 간식 뿌린다고 공지 떴던데 봤어?',
  '와 방금 공지에 시험범위 반으로 줄었다고 올라옴 실화냐고',
  '단톡방에 이번 시험 답 돌고 있다고 난리남ㅋㅋ',
  '교수님 개인 블로그에 출제 힌트 올라왔다고 카더라',
];

export interface HanjaDetail {
  reading: string;   // 독음
  type: '천간' | '지지';
  element: string;   // 오행
  yinyang: string;   // 음양
  meaning: string;   // 의미 / 상징
  role: string;      // 사주에서의 역할
  animal?: string;   // 지지 동물
  time?: string;     // 지지 시간대
}

export const HANJA_INFO: Record<string, HanjaDetail> = {
  // 천간 (天干)
  '甲': { reading: '갑', type: '천간', element: '목(木)', yinyang: '양(陽)', meaning: '큰 나무, 봄의 새싹. 강한 성장 에너지와 도전 정신을 상징합니다.', role: '하늘의 기운(天干)으로 외적 성격과 드러나는 모습을 나타냅니다. 강한 추진력과 리더십의 기운을 부여합니다.' },
  '乙': { reading: '을', type: '천간', element: '목(木)', yinyang: '음(陰)', meaning: '풀과 꽃, 유연한 나무. 부드러운 적응력과 끈질긴 인내를 상징합니다.', role: '하늘의 기운(天干)으로 외적 성격을 나타냅니다. 유연하고 섬세한 감각으로 상황에 맞게 적응하는 능력을 줍니다.' },
  '丙': { reading: '병', type: '천간', element: '화(火)', yinyang: '양(陽)', meaning: '태양, 불꽃. 밝음과 열정, 외향적인 에너지를 상징합니다.', role: '하늘의 기운(天干)으로 밖으로 드러나는 성향을 나타냅니다. 활발하고 적극적이며 주변을 밝히는 존재감을 부여합니다.' },
  '丁': { reading: '정', type: '천간', element: '화(火)', yinyang: '음(陰)', meaning: '촛불, 등불. 집중된 빛과 따뜻한 열기를 상징합니다.', role: '하늘의 기운(天干)으로 내면의 열정과 집중력을 나타냅니다. 섬세하고 예리한 통찰력과 장인 정신을 부여합니다.' },
  '戊': { reading: '무', type: '천간', element: '토(土)', yinyang: '양(陽)', meaning: '큰 산, 넓은 대지. 안정감과 포용력, 묵직한 존재감을 상징합니다.', role: '하늘의 기운(天干)으로 넓고 안정적인 성품을 나타냅니다. 믿음직하고 신의 있는 성격과 넉넉한 포용력을 부여합니다.' },
  '己': { reading: '기', type: '천간', element: '토(土)', yinyang: '음(陰)', meaning: '밭흙, 논밭. 결실을 맺는 부드러운 대지의 기운을 상징합니다.', role: '하늘의 기운(天干)으로 세밀하고 현실적인 성향을 나타냅니다. 꼼꼼하고 신중하게 계획을 실행하는 능력을 부여합니다.' },
  '庚': { reading: '경', type: '천간', element: '금(金)', yinyang: '양(陽)', meaning: '바위, 원석. 단단하고 강인한 금속의 기운을 상징합니다.', role: '하늘의 기운(天干)으로 강인하고 결단력 있는 성격을 나타냅니다. 개혁적이고 의리 있으며 강한 의지력을 부여합니다.' },
  '辛': { reading: '신', type: '천간', element: '금(金)', yinyang: '음(陰)', meaning: '보석, 예리한 칼날. 정제되고 빛나는 금속의 기운을 상징합니다.', role: '하늘의 기운(天干)으로 예민하고 완벽주의적인 성향을 나타냅니다. 날카로운 직관력과 미적 감각, 고집스러운 기준을 부여합니다.' },
  '壬': { reading: '임', type: '천간', element: '수(水)', yinyang: '양(陽)', meaning: '바다, 큰 강. 깊고 광활한 물의 기운을 상징합니다.', role: '하늘의 기운(天干)으로 지혜롭고 포용적인 성격을 나타냅니다. 넓은 식견과 유연한 사고, 변화에 강한 기질을 부여합니다.' },
  '癸': { reading: '계', type: '천간', element: '수(水)', yinyang: '음(陰)', meaning: '비, 이슬, 샘물. 조용하고 투명한 물의 기운을 상징합니다.', role: '하늘의 기운(天干)으로 섬세하고 직관적인 성향을 나타냅니다. 예민한 감수성과 깊은 통찰, 창의적인 상상력을 부여합니다.' },

  // 지지 (地支)
  '子': { reading: '자', type: '지지', element: '수(水)', yinyang: '양(陽)', animal: '쥐', time: '23시~1시', meaning: '한밤중의 기운, 씨앗의 생명력. 지혜로운 번식과 활동성을 상징합니다.', role: '땅의 기운(地支)으로 내면의 성품과 타고난 환경을 나타냅니다. 영리하고 민첩하며 상황 판단이 빠른 기질을 부여합니다.' },
  '丑': { reading: '축', type: '지지', element: '토(土)', yinyang: '음(陰)', animal: '소', time: '1시~3시', meaning: '이른 새벽의 고요함. 묵묵히 쌓아가는 인내와 근면함을 상징합니다.', role: '땅의 기운(地支)으로 내면의 성품을 나타냅니다. 성실하고 꾸준하며 신뢰받는 끈기의 기질을 부여합니다.' },
  '寅': { reading: '인', type: '지지', element: '목(木)', yinyang: '양(陽)', animal: '호랑이', time: '3시~5시', meaning: '새벽의 기운, 산을 누비는 기상. 용기와 강한 추진력을 상징합니다.', role: '땅의 기운(地支)으로 내면의 본능적 기질을 나타냅니다. 대담하고 진취적이며 강한 독립심과 카리스마를 부여합니다.' },
  '卯': { reading: '묘', type: '지지', element: '목(木)', yinyang: '음(陰)', animal: '토끼', time: '5시~7시', meaning: '봄 아침의 기운. 온화하고 재빠른 감각과 문예적 재능을 상징합니다.', role: '땅의 기운(地支)으로 내면의 성품을 나타냅니다. 민첩하고 창의적이며 사교적인 매력과 예술적 감각을 부여합니다.' },
  '辰': { reading: '진', type: '지지', element: '토(土)', yinyang: '양(陽)', animal: '용', time: '7시~9시', meaning: '봄 안개 낀 오전. 변화무쌍한 카리스마와 신비로운 힘을 상징합니다.', role: '땅의 기운(地支)으로 내면의 잠재력을 나타냅니다. 다재다능하고 독창적이며 리더십과 창조적 에너지를 부여합니다.' },
  '巳': { reading: '사', type: '지지', element: '화(火)', yinyang: '음(陰)', animal: '뱀', time: '9시~11시', meaning: '정오 전의 따뜻한 기운. 조용한 지혜와 예리한 신중함을 상징합니다.', role: '땅의 기운(地支)으로 내면의 직관을 나타냅니다. 깊이 생각하고 계산적이며 뛰어난 통찰력과 집중력을 부여합니다.' },
  '午': { reading: '오', type: '지지', element: '화(火)', yinyang: '양(陽)', animal: '말', time: '11시~13시', meaning: '정오의 태양, 최고조의 에너지. 열정과 역동적인 활동력을 상징합니다.', role: '땅의 기운(地支)으로 내면의 열정을 나타냅니다. 활발하고 외향적이며 강한 감정 표현과 넘치는 에너지를 부여합니다.' },
  '未': { reading: '미', type: '지지', element: '토(土)', yinyang: '음(陰)', animal: '양', time: '13시~15시', meaning: '여름 오후의 온기. 온화하고 섬세한 예술적 감각을 상징합니다.', role: '땅의 기운(地支)으로 내면의 감성을 나타냅니다. 부드럽고 친화적이며 배려심 깊고 미적 감각이 뛰어난 기질을 부여합니다.' },
  '申': { reading: '신', type: '지지', element: '금(金)', yinyang: '양(陽)', animal: '원숭이', time: '15시~17시', meaning: '이른 저녁의 활발함. 재치 있고 다재다능한 기민함을 상징합니다.', role: '땅의 기운(地支)으로 내면의 영특함을 나타냅니다. 유연하고 눈치 빠르며 뛰어난 언변과 적응력을 부여합니다.' },
  '酉': { reading: '유', type: '지지', element: '금(金)', yinyang: '음(陰)', animal: '닭', time: '17시~19시', meaning: '저녁 노을의 기운. 꼼꼼하고 날카로운 직관력을 상징합니다.', role: '땅의 기운(地支)으로 내면의 분석력을 나타냅니다. 체계적이고 완벽을 추구하며 정확한 판단력과 예민한 감각을 부여합니다.' },
  '戌': { reading: '술', type: '지지', element: '토(土)', yinyang: '양(陽)', animal: '개', time: '19시~21시', meaning: '늦은 저녁의 따뜻한 불빛. 변함없는 충실함과 의리를 상징합니다.', role: '땅의 기운(地支)으로 내면의 신의(信義)를 나타냅니다. 정직하고 책임감 강하며 신뢰받는 성품과 강한 의지를 부여합니다.' },
  '亥': { reading: '해', type: '지지', element: '수(水)', yinyang: '음(陰)', animal: '돼지', time: '21시~23시', meaning: '깊은 밤의 풍요. 복과 관대함, 넉넉한 베풂을 상징합니다.', role: '땅의 기운(地支)으로 내면의 풍요로움을 나타냅니다. 순수하고 관대하며 행운을 불러오는 복된 기질을 부여합니다.' },
};
