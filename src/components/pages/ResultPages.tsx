import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  getSajuValue, getFiveElements,
  OHC, OHK, OHF, SajuPillar,
  HANJA_INFO, FUNNY_TIPS,
} from '../../constants';
import html2canvas from 'html2canvas';
import { LoadingPlaceholder } from './CommonPages';
import { fetchSubjComment } from '../../lib/utils';

const PENTAGON = [
  { key: '목', x: 100, y: 20  },
  { key: '화', x: 180, y: 80  },
  { key: '토', x: 150, y: 170 },
  { key: '금', x:  50, y: 170 },
  { key: '수', x:  20, y: 80  },
];

const PILLAR_LABELS = ['년', '월', '일', '시'] as const;

const ELEMENT_COLOR: Record<string, string> = {
  '목(木)': '#2E7D32', '화(火)': '#C62828',
  '토(土)': '#E65100', '금(金)': '#37474F', '수(水)': '#1565C0',
};
const ELEMENT_BG: Record<string, string> = {
  '목(木)': '#E8F5E9', '화(火)': '#FFEBEE',
  '토(土)': '#FFF8E1', '금(金)': '#ECEFF1', '수(水)': '#E3F2FD',
};

// ── 주柱 통합 팝업 (천간 + 지지) ────────────────────────────────
const PillarModal = ({
  sky, earth, label, onClose,
}: { sky: string; earth: string; label: string; onClose: () => void }) => {
  const skyInfo  = HANJA_INFO[sky];
  const earthInfo = HANJA_INFO[earth];

  const CharSection = ({
    char, info, charColor,
  }: { char: string; info: typeof skyInfo; charColor: string }) => {
    if (!info) return null;
    const color = ELEMENT_COLOR[info.element] ?? '#8B6914';
    const bg    = ELEMENT_BG[info.element]    ?? '#FFF8E1';
    return (
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="text-[8px] font-bold tracking-widest mb-1.5"
          style={{ color: 'rgba(200,161,75,0.55)' }}>
          {info.type === '천간' ? '天干 · 하늘' : '地支 · 땅'}
        </div>
        <div className="text-[44px] font-serif font-bold leading-none mb-1"
          style={{ color: charColor }}>{char}</div>
        <div className="text-[17px] font-serif font-bold leading-none mb-1.5"
          style={{ color: 'rgba(255,245,220,0.9)' }}>{info.reading}</div>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: bg, color }}>{info.element}</span>
          <span className="text-[9px]" style={{ color: 'rgba(200,161,75,0.7)' }}>{info.yinyang}</span>
        </div>
        {info.animal && (
          <div className="flex gap-1 mb-2 w-full">
            <div className="flex-1 bg-[rgba(200,161,75,0.08)] rounded px-1 py-1 text-center border border-[rgba(200,161,75,0.12)]">
              <div className="text-[7px] mb-0.5" style={{ color: 'rgba(200,161,75,0.5)' }}>동물</div>
              <div className="text-[11px] font-bold" style={{ color: 'rgba(255,245,220,0.85)' }}>{info.animal}</div>
            </div>
            <div className="flex-1 bg-[rgba(200,161,75,0.08)] rounded px-1 py-1 text-center border border-[rgba(200,161,75,0.12)]">
              <div className="text-[7px] mb-0.5" style={{ color: 'rgba(200,161,75,0.5)' }}>시간대</div>
              <div className="text-[9px] font-bold" style={{ color: 'rgba(255,245,220,0.85)' }}>{info.time}</div>
            </div>
          </div>
        )}
        <div className="w-full mb-1.5">
          <div className="text-[7px] font-bold mb-0.5" style={{ color: 'rgba(200,161,75,0.5)' }}>✦ 상징</div>
          <p className="text-[10px] leading-relaxed italic" style={{ color: 'rgba(255,245,220,0.75)' }}>{info.meaning}</p>
        </div>
        <div className="w-full bg-[rgba(200,161,75,0.07)] rounded-lg px-2 py-1.5 border-l-2 border-[rgba(200,161,75,0.3)]">
          <div className="text-[7px] font-bold mb-0.5" style={{ color: 'rgba(200,161,75,0.5)' }}>✦ 역할</div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,245,220,0.72)' }}>{info.role}</p>
        </div>
      </div>
    );
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,5,0,0.75)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative max-w-[360px] w-full rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
        style={{ background: '#1E110A', border: '1.5px solid rgba(200,161,75,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-[#C8A14B]/20">
          <span className="text-[10px] font-bold tracking-widest"
            style={{ color: 'rgba(200,161,75,0.7)' }}>
            {label}주 (四柱) · 한자 풀이
          </span>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold"
            style={{ color: 'rgba(200,161,75,0.5)', background: 'rgba(200,161,75,0.08)' }}>
            ✕
          </button>
        </div>

        <div className="px-4 py-3 flex gap-3">
          <CharSection char={sky}   info={skyInfo}   charColor="#A0C4F0" />
          <div className="w-px self-stretch bg-[rgba(200,161,75,0.2)]" />
          <CharSection char={earth} info={earthInfo} charColor="#F0A090" />
        </div>

        <div className="px-4 pb-3 pt-0 text-center">
          <span className="text-[8px] tracking-[0.3em]" style={{ color: 'rgba(200,161,75,0.25)' }}>
            ✦ 팔자대학 한자 풀이 ✦
          </span>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ── 주柱 박스 (i 버튼 1개) ──────────────────────────────────────
const PillarBox = ({ pillar, label }: { pillar: SajuPillar; label: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="relative text-center bg-white border border-[#C8A14B]/20 rounded-lg p-1.5 shadow-md">
        <button
          onClick={e => { e.stopPropagation(); setOpen(true); }}
          className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold opacity-60 hover:opacity-100 active:scale-90 transition-all"
          style={{
            background: 'rgba(200,161,75,0.15)',
            border: '1px solid rgba(200,161,75,0.5)',
            color: '#8B6914',
          }}
          aria-label={`${label}주 한자 풀이`}
        >i</button>
        <span className="block text-[18px] font-bold font-serif text-[#003087] leading-tight mt-1">{pillar.sky}</span>
        <span className="block text-[18px] font-bold font-serif text-[#8B2500] leading-tight">{pillar.earth}</span>
        <div className="text-[9px] text-[#A09060] mt-0.5 font-bold">{label}주</div>
      </div>
      <AnimatePresence>
        {open && <PillarModal sky={pillar.sky} earth={pillar.earth} label={label} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export const MyResult1 = ({ myData, aiFortune, loadingAi, onSave }: any) => {
  if (!myData) return <LoadingPlaceholder text="사주 입력 후 공개됩니다" />;

  const s = myData.saju;
  const elements = getFiveElements(s);
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;

  const polygonPath = PENTAGON.map(({ key, x, y }) => {
    const ratio = ((elements[key] || 0) / 8) * 0.8 + 0.2;
    return `${100 + (x - 100) * ratio},${100 + (y - 100) * ratio}`;
  }).join(' ');

  const labelPos = PENTAGON.map(({ key, x, y }) => ({
    key,
    lx: x + (x > 120 ? 14 : x < 80 ? -14 : 0),
    ly: y + (y < 50 ? -14 : y > 140 ? 20 : 0),
    anchor: (x > 120 ? 'start' : x < 80 ? 'end' : 'middle') as 'start' | 'end' | 'middle',
  }));

  return (
    <div className="w-full h-full page-bg">
      <div className="pt-4 px-4" id="my-result-1">
        <div className="relative flex items-center justify-center mb-2">
          <div className="font-serif text-[16px] font-bold text-[#3D1F0A]">{myData.name}의 사주</div>
          <button onClick={(e) => { e.stopPropagation(); onSave(); }}
            className="absolute right-0 p-1.5 bg-[#C8A14B]/20 rounded-md hover:bg-[#C8A14B]/40 transition-colors text-[10px] text-[#8B6914] font-bold border border-[#C8A14B]/30">
            💾 저장
          </button>
        </div>
        <div className="text-[11px] text-[#8B6914] text-center mb-2">
          {new Date(myData.date).getFullYear()}년생 · {s.zodiac}띠
        </div>

        {/* 하늘이 내린 전언 */}
        <div className="bg-[#C8A14B]/10 border border-[#C8A14B]/20 rounded-xl p-3 mb-3 shadow-md">
          <div className="text-[11px] text-[#8B6914] font-bold mb-1 flex items-center gap-2">
            <span className="text-base">✦</span> 하늘이 내린 전언
          </div>
          <div className="text-[12px] text-[#3D1F0A] leading-relaxed font-medium"
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
            {loadingAi ? (
              <div className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block text-base">🌀</motion.span>
                <span className="text-[11px]">천기의 흐름을 읽는 중...</span>
              </div>
            ) : (
              aiFortune || '분석 결과가 없습니다.'
            )}
          </div>
        </div>

        {/* 사주 팔자 */}
        <div className="text-[11px] text-[#8B6914] font-bold mb-0.5 uppercase tracking-wider mt-3">사주 팔자 (四柱八字)</div>
        <p className="text-[10px] text-[#A09060] mb-1.5">
          * 년·월·일·시주는 태어난 연도·달·날짜·시간을 의미합니다. &nbsp;
          각 박스의 <span className="text-[#C8A14B]/70 font-bold">i</span> 버튼으로 한자를 풀어보세요.
        </p>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {(['year', 'month', 'day', 'hour'] as const).map((k, i) => (
            <PillarBox key={k} pillar={s[k] as SajuPillar} label={PILLAR_LABELS[i]} />
          ))}
        </div>

        {/* 오행 분석 */}
        <div className="text-[11px] text-[#8B6914] font-bold mb-1 uppercase tracking-wider">오행 분석 (五行分析)</div>
        <div className="relative flex items-center justify-center bg-white/50 rounded-2xl p-2 border border-[#C8A14B]/15 mb-2 shadow-md">
          <div className="w-[220px] h-[220px]">
            <svg viewBox="-15 -30 230 260" className="w-full h-full">
              <polygon points="100,20 180,80 150,170 50,170 20,80"
                fill="none" stroke="#C8A14B" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
              {[0.25, 0.5, 0.75].map(r => (
                <polygon key={r}
                  points={PENTAGON.map(({ x, y }) => `${100 + (x-100)*r},${100 + (y-100)*r}`).join(' ')}
                  fill="none" stroke="#C8A14B" strokeWidth="0.5" opacity="0.2" />
              ))}
              <polygon points={polygonPath} fill="rgba(200,161,75,0.4)" stroke="#8B6914" strokeWidth="2" />
              {labelPos.map(({ key, lx, ly, anchor }) => (
                <g key={key}>
                  <text x={lx} y={ly} textAnchor={anchor} fontSize="19" fontWeight="bold"
                    fill={OHF[key]} fontFamily="serif">{OHK[key]}</text>
                  <text x={lx + 1} y={ly + 16} textAnchor={anchor} fontSize="13"
                    fill={OHF[key]} fontFamily="sans-serif">
                    {Math.round((elements[key] / total) * 100)}%
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
            {(['목', '화', '토', '금', '수'] as const).filter(k => elements[k] > 0).map(k => (
              <span key={k} className={`px-2.5 py-1 rounded-full text-[12px] font-bold ${OHC[k]}`}>
                {OHK[k]} {elements[k]}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const getSubjOh = (name: string) => {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Object.keys(OHK)[hash % Object.keys(OHK).length];
};

export const SubjCompatPage = ({ myData }: any) => {
  const [aiComments, setAiComments] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (!myData) return;

    const cacheKey = `subjComments_${myData.name}_${myData.date}_${myData.subjects.join(',')}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setAiComments(JSON.parse(cached));
      return;
    }

    setLoadingComments(true);
    setAiComments({});

    const s = myData.saju;
    const sv = getSajuValue(s);
    const myOh = getFiveElements(s);

    const promises = myData.subjects.map((subj: string, i: number) => {
      const oh = getSubjOh(subj);
      const score = Math.min(99, Math.max(30, 40 + (myOh[oh] || 0) * 12 + (sv + i * 13) % 35));
      const topEls = Object.entries(myOh as Record<string, number>)
        .filter(([, v]) => v > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([k, v]) => `${OHK[k]}(${v})`)
        .join(' ');
      const keywords = `과목 오행: ${OHK[oh]}, 사주 오행: ${topEls}, 궁합 점수: ${score}점`;
      return fetchSubjComment(subj, keywords, score).then(comment => ({ i, comment }));
    });

    Promise.all(promises).then(results => {
      const map: Record<number, string> = {};
      results.forEach(({ i, comment }) => { if (comment) map[i] = comment; });
      setAiComments(map);
      setLoadingComments(false);
      localStorage.setItem(cacheKey, JSON.stringify(map));
    });
  }, [myData]);

  if (!myData) return <LoadingPlaceholder text="과목 입력 후 공개됩니다" />;

  const s = myData.saju;
  const sv = getSajuValue(s);
  const myOh = getFiveElements(s);

  return (
    <div className="w-full h-full page-bg">
      <div className="pt-4 px-4 h-full flex flex-col" id="subj-compat">
        <div className="relative flex items-center justify-center mb-3">
          <div className="font-serif text-[16px] font-bold text-[#3D1F0A]">과목별 궁합 분석 (科目宮合)</div>
          <button onClick={async (e) => {
            e.stopPropagation();
            const el = document.getElementById('subj-compat');
            if (!el) return;
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
            const link = document.createElement('a');
            link.download = '과목궁합_결과.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }}
            className="absolute right-0 p-1.5 bg-[#C8A14B]/20 rounded-md hover:bg-[#C8A14B]/40 transition-colors text-[10px] text-[#8B6914] font-bold border border-[#C8A14B]/30">
            💾 저장
          </button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
          {myData.subjects.map((subj: string, i: number) => {
            const oh = getSubjOh(subj);
            const score = Math.min(99, Math.max(30, 40 + (myOh[oh] || 0) * 12 + (sv + i * 13) % 35));
            const elementColor = OHF[oh];
            const comment = aiComments[i];
            const isLoading = loadingComments && !aiComments[i];
            return (
              <div key={i} className="bg-white/40 border border-[#C8A14B]/15 rounded-xl p-2.5 shadow-md">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${OHC[oh]}`}>{OHK[oh]}</span>
                    <span className="text-[13px] font-bold text-[#3D1F0A]">{subj}</span>
                  </div>
                  <span className="text-[16px] font-serif font-bold" style={{ color: elementColor }}>{score}점</span>
                </div>
                <div className="h-1 bg-[#C8A14B]/10 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${score}%`, backgroundColor: elementColor }} />
                </div>
                <div className="text-[10px] text-[#5C3010] leading-snug whitespace-pre-line"
                  style={{ wordBreak: 'keep-all', minHeight: 14 }}>
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">🌀</motion.span>
                      <span>운명의 실을 읽는 중...</span>
                    </span>
                  ) : comment}
                </div>
                {!isLoading && comment && (
                  <div className="mt-1.5 text-[10px] text-[#5C3010] italic"
                    style={{ wordBreak: 'keep-all' }}>
                    {FUNNY_TIPS[(sv + i) % FUNNY_TIPS.length]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
