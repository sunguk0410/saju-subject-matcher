import { motion } from 'motion/react';
import { useState } from 'react';

interface LandingProps {
  onOpen: () => void;
}

export default function Landing({ onOpen }: LandingProps) {
  const [hovered, setHovered] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  const coverTransform = (!isMobile && hovered)
    ? 'perspective(900px) rotateX(4deg) rotateY(-10deg) translateY(-10px)'
    : 'perspective(900px) rotateX(4deg) rotateY(-22deg)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-8 z-10 w-full select-none"
    >
      {/* ── 책 표지 위 타이틀 ─────────────────── */}
      <div className="text-[#C8A14B] font-serif text-base tracking-[5px] mb-1">✦ 궁합 매칭 시스템 ✦</div>
      <div className="text-[#5C4020] text-[12px] tracking-[2px] mb-12 uppercase">중간고사 사주 궁합 특별판 · 八字大學</div>

      {/* ── 책 표지 ───────────────────────────── */}
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: 'pointer',
          width: 230,
          height: 320,
          position: 'relative',
          transform: coverTransform,
          transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          background: 'linear-gradient(158deg, #7D3C1E 0%, #5C2A0F 52%, #6B3118 100%)',
          borderRadius: '2px 10px 10px 2px',
          overflow: 'hidden',
          // 왼쪽 여러 겹 그림자 = 책 두께(척추) 시뮬레이션
          boxShadow: `
            -4px  0px 0px #5A2410,
            -8px  0px 0px #4A1C0C,
            -12px 0px 0px #3A1508,
            -14px 2px 4px rgba(0,0,0,0.5),
            8px 24px 50px rgba(0,0,0,0.75),
            0px  6px 18px rgba(0,0,0,0.5)
          `,
        }}
      >
        {/* 나뭇결 패턴 */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(168deg, transparent, transparent 5px, rgba(0,0,0,1) 5px, rgba(0,0,0,1) 6px)',
        }} />

        {/* 내부 테두리 프레임 */}
        <div style={{
          position: 'absolute',
          top: 14, right: 14, bottom: 14, left: 14,
          border: '1px solid rgba(255,245,215,0.38)',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 8px 12px',
          pointerEvents: 'none',
        }}>

          {/* 최상단 뱃지 */}
          <div style={{
            fontSize: 8,
            fontFamily: 'serif',
            color: 'rgba(200,161,75,0.75)',
            letterSpacing: '0.35em',
            whiteSpace: 'nowrap',
            marginBottom: 6,
          }}>
            ✦ 秘傳 ✦
          </div>

          {/* 메인 타이틀 */}
          <div style={{
            fontSize: 38,
            fontWeight: 700,
            fontFamily: 'serif',
            color: 'rgba(255,248,225,0.97)',
            letterSpacing: '0.06em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textShadow: '0 2px 16px rgba(0,0,0,0.55)',
          }}>
            八字大學
          </div>

          {/* 한글 독음 */}
          <div style={{
            fontSize: 9,
            fontFamily: 'serif',
            color: 'rgba(255,245,215,0.5)',
            letterSpacing: '0.42em',
            whiteSpace: 'nowrap',
            marginTop: 4,
          }}>
            팔 자 대 로
          </div>

          {/* 구분선 */}
          <div style={{
            width: '70%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(200,161,75,0.5), transparent)',
            margin: '10px 0',
          }} />

          {/* 부제 — 중간고사 운빨 전략 */}
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'serif',
            color: 'rgba(255,228,160,0.9)',
            letterSpacing: '0.04em',
            textAlign: 'center',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
          }}>
            중간고사<br />운빨 전략
          </div>

          {/* 특별판 뱃지 */}
          <div style={{
            marginTop: 7,
            fontSize: 8,
            fontFamily: 'serif',
            color: 'rgba(200,161,75,0.85)',
            letterSpacing: '0.22em',
            border: '1px solid rgba(200,161,75,0.35)',
            borderRadius: 2,
            padding: '2px 7px',
            whiteSpace: 'nowrap',
          }}>
            · 특별판 ·
          </div>

          {/* 중앙 여백 */}
          <div style={{ flex: 1 }} />

          {/* 구분선 */}
          <div style={{
            width: '60%', height: 1,
            background: 'linear-gradient(to right, transparent, rgba(255,245,215,0.2), transparent)',
            marginBottom: 8,
          }} />

          {/* 궁합 매칭 시스템 */}
          <div style={{
            fontSize: 9,
            fontFamily: 'serif',
            color: 'rgba(255,245,215,0.55)',
            letterSpacing: '0.18em',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            marginBottom: 4,
          }}>
            ◆ 궁합 매칭 시스템 ◆
          </div>

          {/* 하단 태그라인 */}
          <div style={{
            fontSize: 7,
            color: 'rgba(255,245,215,0.35)',
            letterSpacing: '0.2em',
            fontFamily: 'serif',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}>
            시험은 전략, 합격은 천기
          </div>
        </div>

        {/* 제본부 왼쪽 안쪽 그림자 */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
          background: 'linear-gradient(to right, rgba(0,0,0,0.45), transparent)',
          pointerEvents: 'none',
        }} />

        {/* 오른쪽 하이라이트 (빛 반사) */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
          background: 'linear-gradient(to left, rgba(255,200,120,0.04), transparent)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* 바닥 그림자 */}
      <div style={{
        width: 160,
        height: 16,
        marginTop: 2,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 72%)',
        filter: 'blur(6px)',
        pointerEvents: 'none',
      }} />

      <motion.div
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[#C8A14B] text-[13px] mt-8 tracking-[2px] font-serif"
      >
        📖 클릭하는 순간 당신의 운명이 펼쳐집니다
      </motion.div>
    </motion.div>
  );
}
