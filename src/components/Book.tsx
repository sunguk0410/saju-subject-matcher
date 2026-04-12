import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserData } from '../types';
import PageContent from './PageContent';

interface BookProps {
  myData: UserData | null;
  setMyData: (data: UserData | null) => void;
  draftMyData: any;
  setDraftMyData: (data: any) => void;
  aiFortune: string;
  setAiFortune: (fortune: string) => void;
  loadingAi: boolean;
  onClose: () => void;
}

const SPREADS = [
  { l: 'cover', r: 'myForm', lbl: '표지 · 정보 입력' },
  { l: 'myR1', r: 'subjCompat', lbl: '사주 분석 · 과목 궁합' },
  { l: 'share', r: 'fin', lbl: '공유 · 끝' },
];

const ALL_PAGES = [
  { type: 'cover', lbl: '표지' },
  { type: 'myForm', lbl: '정보 입력' },
  { type: 'myR1', lbl: '사주 분석' },
  { type: 'subjCompat', lbl: '과목 궁합' },
  { type: 'share', lbl: '공유' },
  { type: 'fin', lbl: '끝' },
];

// 플립 전체 시간 및 중간 시점 (배경 내용 교체 타이밍)
const FLIP_MS = 1200;
const FLIP_MID_MS = FLIP_MS / 2;
const FLIP_EASE: [number, number, number, number] = [0.645, 0.045, 0.355, 1.0];

// 모바일 슬라이드
const MOBILE_MS = 550;
const MOBILE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

interface FlipInfo {
  fromIdx: number;
  toIdx: number;
  dir: 'next' | 'prev';
}

const mobileVariants = {
  enter: (dir: string) => ({ y: dir === 'next' ? '100%' : '-100%' }),
  center: { y: 0, transition: { duration: MOBILE_MS / 1000, ease: MOBILE_EASE } },
  exit: (dir: string) => ({
    y: dir === 'next' ? '-100%' : '100%',
    transition: { duration: MOBILE_MS / 1000, ease: MOBILE_EASE },
  }),
};

export default function Book({ myData, setMyData, draftMyData, setDraftMyData, aiFortune, setAiFortune, loadingAi, onClose }: BookProps) {
  // ── 데스크톱 상태 ────────────────────────────────────────────
  const [cur, setCur] = useState(0);               // 내비게이션 현재 위치
  const [displayedCur, setDisplayedCur] = useState(0); // 배경에 실제 표시 중인 스프레드
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipInfo, setFlipInfo] = useState<FlipInfo | null>(null); // 플립 패널 콘텐츠 고정

  // ── 모바일 상태 ──────────────────────────────────────────────
  const [mobilePage, setMobilePage] = useState(0);
  const [mobileDir, setMobileDir] = useState<'next' | 'prev'>('next');
  const [mobileAnim, setMobileAnim] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  // 뷰포트 높이 기준 동적 책 높이: 네비(~90px) + 래퍼 패딩/보더(~48px) + 여유(~52px) = 190px 차감
  const calcBookHeight = () => Math.min(650, Math.max(480, window.innerHeight - 190));
  const [bookHeight, setBookHeight] = useState(calcBookHeight);

  const curRef = useRef(cur);
  const mobilePageRef = useRef(mobilePage);
  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => { mobilePageRef.current = mobilePage; }, [mobilePage]);

  useEffect(() => {
    const onResize = () => {
      setBookHeight(calcBookHeight());
      const mobile = window.innerWidth < 768;
      setIsMobile(prev => {
        if (prev !== mobile) {
          if (mobile) {
            setMobilePage(curRef.current * 2);
          } else {
            const s = Math.floor(mobilePageRef.current / 2);
            setCur(s);
            setDisplayedCur(s);
          }
        }
        return mobile;
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── 핸들러 ──────────────────────────────────────────────────
  const handleNext = () => {
    if (isMobile) {
      if (mobilePage < ALL_PAGES.length - 1 && !mobileAnim) {
        setMobileDir('next');
        setMobileAnim(true);
        setMobilePage(p => p + 1);
        setTimeout(() => setMobileAnim(false), MOBILE_MS);
      }
      return;
    }
    if (cur < SPREADS.length - 1 && !isFlipping) {
      const fromIdx = cur;
      const toIdx = cur + 1;
      setCur(toIdx);
      setIsFlipping(true);
      setFlipInfo({ fromIdx, toIdx, dir: 'next' });
      // 플립 중간 시점에 배경 스프레드 교체 (우측 배경이 자연스럽게 전환)
      setTimeout(() => setDisplayedCur(toIdx), FLIP_MID_MS);
      // 플립 완료 후 정리
      setTimeout(() => { setIsFlipping(false); setFlipInfo(null); }, FLIP_MS);
    }
  };

  const handlePrev = () => {
    if (isMobile) {
      if (mobilePage > 0 && !mobileAnim) {
        setMobileDir('prev');
        setMobileAnim(true);
        setMobilePage(p => p - 1);
        setTimeout(() => setMobileAnim(false), MOBILE_MS);
      }
      return;
    }
    if (cur > 0 && !isFlipping) {
      const fromIdx = cur;
      const toIdx = cur - 1;
      setCur(toIdx);
      setIsFlipping(true);
      setFlipInfo({ fromIdx, toIdx, dir: 'prev' });
      setTimeout(() => setDisplayedCur(toIdx), FLIP_MID_MS);
      setTimeout(() => { setIsFlipping(false); setFlipInfo(null); }, FLIP_MS);
    }
  };

  const pageProps = { myData, setMyData, draftMyData, setDraftMyData, aiFortune, setAiFortune, loadingAi };

  // ── 모바일 렌더 ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col bg-[#1A0F05]"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[#2D1B0E] border-b border-[#5C3010] shrink-0">
          <span className="text-[#FFD700] text-sm font-serif font-bold tracking-widest">
            {ALL_PAGES[mobilePage].lbl}
          </span>
          <div className="flex gap-1">
            {ALL_PAGES.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mobilePage ? 'bg-[#FFD700]' : 'bg-[#FFD700]/20'}`} />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#8B1A1A] text-[#FFD700] flex items-center justify-center font-bold hover:bg-[#6B0A0A] transition-all text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="sync" custom={mobileDir}>
            <motion.div
              key={mobilePage}
              custom={mobileDir}
              variants={mobileVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 bg-[#FAF3DC] overflow-y-auto no-scrollbar"
            >
              <PageContent
                type={ALL_PAGES[mobilePage].type}
                {...pageProps}
                pageNumber={mobilePage}
                onNext={handleNext}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-[#2D1B0E] border-t border-[#5C3010] px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={mobilePage === 0 || mobileAnim}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#C8A14B] text-[#3D1F0A] font-bold text-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E8C060] transition-all shadow-md active:scale-95"
            >
              <span>↑</span>
              <span>이전</span>
            </button>
            <span className="text-[#C8A14B]/60 text-[10px] font-serif tracking-[0.2em]">✦ 중간고사 특별판 ✦</span>
            <button
              onClick={handleNext}
              disabled={mobilePage === ALL_PAGES.length - 1 || mobileAnim || mobilePage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#C8A14B] text-[#3D1F0A] font-bold text-sm disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E8C060] transition-all shadow-md active:scale-95"
            >
              <span>다음</span>
              <span>↓</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── 데스크톱 렌더 ─────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="relative z-50 w-full max-w-[900px] flex flex-col items-center"
    >
      {/* 닫기 버튼 — 책 바깥 오른쪽 */}
      <button
        onClick={onClose}
        className="absolute top-0 -right-12 w-9 h-9 rounded-full bg-[#8B1A1A] text-[#FFD700] flex items-center justify-center font-bold hover:bg-[#6B0A0A] transition-all shadow-lg z-[100] text-base"
      >
        ✕
      </button>

      <div className="w-full bg-[#2D1B0E] rounded-2xl p-4 border-4 border-[#5C3010] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        {/* 책 본체 */}
        <div
          className="relative w-full bg-[#FAF3DC] rounded-xl overflow-hidden flex shadow-inner"
          style={{ perspective: '2000px', height: bookHeight }}
        >
          {/* 중앙 제본 선 */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[6px] h-full bg-gradient-to-r from-[rgba(0,0,0,0.4)] via-[rgba(200,161,75,0.1)] to-[rgba(0,0,0,0.4)] z-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none z-0" />

          {/* ── 배경 스프레드 (displayedCur 기준) ── */}
          <div className="absolute inset-0 flex">
            {/* 왼쪽 페이지 */}
            <div className="w-1/2 h-full bg-[#F5EDD0] border-r border-[#C8A14B]/30 relative overflow-hidden">
              <div className="absolute right-0 inset-y-0 w-[30px] bg-gradient-to-l from-[rgba(80,40,5,0.15)] to-transparent pointer-events-none z-[10]" />
              <div className="h-full overflow-y-auto no-scrollbar">
                <PageContent type={SPREADS[displayedCur].l} {...pageProps} pageNumber={displayedCur * 2} onNext={handleNext} />
              </div>
            </div>
            {/* 오른쪽 페이지 */}
            <div className="w-1/2 h-full bg-[#FAF3DC] relative overflow-hidden">
              <div className="absolute left-0 inset-y-0 w-[30px] bg-gradient-to-r from-[rgba(80,40,5,0.15)] to-transparent pointer-events-none z-[10]" />
              <div className="h-full overflow-y-auto no-scrollbar">
                <PageContent type={SPREADS[displayedCur].r} {...pageProps} pageNumber={displayedCur * 2 + 1} onNext={handleNext} />
              </div>
            </div>
          </div>

          {/* ── 3D 플립 애니메이션 ── */}
          {isFlipping && flipInfo && (
            <>
              {/* 착지 면 그림자 (중간에 가장 짙어짐) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.28, 0] }}
                transition={{ duration: FLIP_MS / 1000, times: [0, 0.5, 1], ease: 'linear' }}
                style={{
                  position: 'absolute',
                  top: 0,
                  [flipInfo.dir === 'next' ? 'left' : 'right']: 0,
                  width: '50%',
                  height: '100%',
                  background: flipInfo.dir === 'next'
                    ? 'linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 80%)'
                    : 'linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 80%)',
                  zIndex: 35,
                  pointerEvents: 'none',
                }}
              />

              {/* 플립 패널 */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: flipInfo.dir === 'next' ? -180 : 180 }}
                transition={{ duration: FLIP_MS / 1000, ease: FLIP_EASE }}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: flipInfo.dir === 'next' ? 'left center' : 'right center',
                  position: 'absolute',
                  top: 0,
                  [flipInfo.dir === 'next' ? 'right' : 'left']: 0,
                  width: '50%',
                  height: '100%',
                  zIndex: 40,
                }}
              >
                {/* 앞면: 넘어가는 페이지 */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: flipInfo.dir === 'next' ? '#FAF3DC' : '#F5EDD0',
                  }}
                >
                  <div className="h-full overflow-hidden">
                    <PageContent
                      type={flipInfo.dir === 'next' ? SPREADS[flipInfo.fromIdx].r : SPREADS[flipInfo.fromIdx].l}
                      {...pageProps}
                      pageNumber={flipInfo.dir === 'next' ? flipInfo.fromIdx * 2 + 1 : flipInfo.fromIdx * 2}
                      onNext={handleNext}
                    />
                  </div>
                  {/* 접히는 쪽 그림자 */}
                  <div
                    className="absolute inset-y-0 w-10 pointer-events-none"
                    style={{
                      [flipInfo.dir === 'next' ? 'left' : 'right']: 0,
                      background: flipInfo.dir === 'next'
                        ? 'linear-gradient(to right, rgba(0,0,0,0.18), transparent)'
                        : 'linear-gradient(to left, rgba(0,0,0,0.18), transparent)',
                    }}
                  />
                </div>

                {/* 뒷면: 도착하는 페이지 */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: flipInfo.dir === 'next' ? '#F5EDD0' : '#FAF3DC',
                  }}
                >
                  <div className="h-full overflow-hidden">
                    <PageContent
                      type={flipInfo.dir === 'next' ? SPREADS[flipInfo.toIdx].l : SPREADS[flipInfo.toIdx].r}
                      {...pageProps}
                      pageNumber={flipInfo.dir === 'next' ? flipInfo.toIdx * 2 : flipInfo.toIdx * 2 + 1}
                      onNext={handleNext}
                    />
                  </div>
                  {/* 펼쳐지는 쪽 그림자 */}
                  <div
                    className="absolute inset-y-0 w-10 pointer-events-none"
                    style={{
                      [flipInfo.dir === 'next' ? 'right' : 'left']: 0,
                      background: flipInfo.dir === 'next'
                        ? 'linear-gradient(to left, rgba(0,0,0,0.12), transparent)'
                        : 'linear-gradient(to right, rgba(0,0,0,0.12), transparent)',
                    }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* 내비게이션 */}
        <div className="flex flex-col items-center mt-6">
          <div className="flex items-center gap-8">
            <button
              onClick={handlePrev}
              disabled={cur === 0 || isFlipping}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A14B] text-[#3D1F0A] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E8C060] transition-all shadow-md active:scale-95"
            >
              <span className="text-xl">←</span>
              <span className="text-[11px] uppercase tracking-tighter">이전</span>
            </button>

            <div className="flex flex-col items-center min-w-[140px]">
              <span className="text-[#FFD700] text-[13px] font-serif font-bold tracking-widest mb-1 drop-shadow-sm">{SPREADS[cur].lbl}</span>
              <div className="flex gap-1">
                {SPREADS.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === cur ? 'bg-[#FFD700]' : 'bg-[#FFD700]/20'}`} />
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={cur === SPREADS.length - 1 || isFlipping || cur === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A14B] text-[#3D1F0A] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E8C060] transition-all shadow-md active:scale-95"
            >
              <span className="text-[11px] uppercase tracking-tighter">다음</span>
              <span className="text-xl">→</span>
            </button>
          </div>
          <div className="text-[#C8A14B]/60 text-[10px] mt-3 tracking-[0.2em] font-serif uppercase">
            ✦ 중간고사 특별판 ✦
          </div>
        </div>
      </div>
    </motion.div>
  );
}
