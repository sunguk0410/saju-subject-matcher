import { useState } from 'react';
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
  onClose: () => void;
}

const SPREADS = [
  { l: 'cover', r: 'myForm', lbl: '표지 · 정보 입력' },
  { l: 'myR1', r: 'subjCompat', lbl: '사주 분석 · 과목 궁합' },
  { l: 'share', r: 'fin', lbl: '공유 · 끝' },
];

export default function Book({ myData, setMyData, draftMyData, setDraftMyData, aiFortune, setAiFortune, onClose }: BookProps) {
  const [cur, setCur] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const handleNext = () => {
    if (cur < SPREADS.length - 1 && !isFlipping) {
      setDirection('next');
      setIsFlipping(true);
      setTimeout(() => { setCur(prev => prev + 1); setIsFlipping(false); }, 600);
    }
  };

  const handlePrev = () => {
    if (cur > 0 && !isFlipping) {
      setDirection('prev');
      setIsFlipping(true);
      setTimeout(() => { setCur(prev => prev - 1); setIsFlipping(false); }, 600);
    }
  };

  const pageProps = { myData, setMyData, draftMyData, setDraftMyData, aiFortune, setAiFortune };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="relative z-50 w-full max-w-[900px] flex flex-col items-center"
    >
      <button
        onClick={onClose}
        className="absolute -top-14 -right-2 w-10 h-10 rounded-full bg-[#8B1A1A] text-[#FFD700] flex items-center justify-center font-bold hover:bg-[#6B0A0A] transition-all shadow-lg z-[100] text-xl"
      >
        ✕
      </button>

      <div className="w-full bg-[#2D1B0E] rounded-2xl p-4 border-4 border-[#5C3010] shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        <div className="relative w-full h-[650px] bg-[#FAF3DC] rounded-xl overflow-hidden flex shadow-inner perspective-2000">
          <div className="absolute left-1/2 -translate-x-1/2 w-[6px] h-full bg-gradient-to-r from-[rgba(0,0,0,0.4)] via-[rgba(200,161,75,0.1)] to-[rgba(0,0,0,0.4)] z-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-20 pointer-events-none z-0" />

          {/* Left Page */}
          <div className="w-1/2 h-full bg-[#F5EDD0] border-r border-[#C8A14B]/30 relative overflow-hidden">
            <div className="absolute right-0 inset-y-0 w-[30px] bg-gradient-to-l from-[rgba(80,40,5,0.15)] to-transparent pointer-events-none z-[10]" />
            <div className="h-full overflow-y-auto no-scrollbar">
              <PageContent type={SPREADS[cur].l} {...pageProps} pageNumber={cur * 2} onNext={handleNext} />
            </div>
          </div>

          {/* Right Page */}
          <div className="w-1/2 h-full bg-[#FAF3DC] relative overflow-hidden">
            <div className="absolute left-0 inset-y-0 w-[30px] bg-gradient-to-r from-[rgba(80,40,5,0.15)] to-transparent pointer-events-none z-[10]" />
            <div className="h-full overflow-y-auto no-scrollbar">
              <PageContent type={SPREADS[cur].r} {...pageProps} pageNumber={cur * 2 + 1} onNext={handleNext} />
            </div>
          </div>

          {/* Flip Animation */}
          <AnimatePresence initial={false}>
            {isFlipping && (
              <motion.div
                key={cur + direction}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: direction === 'next' ? -180 : 180 }}
                transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1] }}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: direction === 'next' ? 'left center' : 'right center',
                  position: 'absolute',
                  top: 0,
                  ...(direction === 'next' ? { right: 0 } : { left: 0 }),
                  width: '50%',
                  height: '100%',
                  zIndex: 40,
                }}
              >
                <div className="absolute inset-0 bg-[#FAF3DC] shadow-2xl border-l border-[#C8A14B]/20" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="h-full overflow-hidden opacity-40">
                    <PageContent type={direction === 'next' ? SPREADS[cur].r : SPREADS[cur].l} {...pageProps} pageNumber={direction === 'next' ? cur * 2 + 1 : cur * 2} onNext={handleNext} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-[#F5EDD0] shadow-2xl border-r border-[#C8A14B]/20" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="h-full overflow-hidden">
                    <PageContent type={direction === 'next' ? SPREADS[cur + 1].l : SPREADS[cur - 1].r} {...pageProps} pageNumber={direction === 'next' ? (cur + 1) * 2 : (cur - 1) * 2 + 1} onNext={handleNext} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
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
              disabled={cur === SPREADS.length - 1 || isFlipping}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A14B] text-[#3D1F0A] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[#E8C060] transition-all shadow-md active:scale-95"
            >
              <span className="text-[11px] uppercase tracking-tighter">다음</span>
              <span className="text-xl">→</span>
            </button>
          </div>
          <div className="text-[#C8A14B]/60 text-[10px] mt-3 tracking-[0.2em] font-serif uppercase">
            ✦ 숭실대학교 중간고사 특별판 ✦
          </div>
        </div>
      </div>
    </motion.div>
  );
}
