import { motion } from 'motion/react';
import { useState } from 'react';

interface LandingProps {
  onOpen: () => void;
}

export default function Landing({ onOpen }: LandingProps) {
  const [hovered, setHovered] = useState(false);

  const coverTransform = hovered
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
          padding: '14px 8px 14px',
          gap: 0,
          pointerEvents: 'none',
        }}>

          {/* 상단 타이틀 그룹 — 책 표지처럼 위쪽 배치 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            marginTop: 4,
          }}>
            <div style={{
              fontSize: 36,
              fontWeight: 700,
              fontFamily: 'serif',
              color: 'rgba(255,245,215,0.58)',
              letterSpacing: '0.06em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
              textShadow: '0 2px 16px rgba(0,0,0,0.55)',
            }}>
              八字大學
            </div>
            <div style={{
              fontSize: 10,
              fontFamily: 'serif',
              color: 'rgba(255,245,215,0.58)',
              letterSpacing: '0.45em',
              whiteSpace: 'nowrap',
            }}>
              팔 자 대 학
            </div>
          </div>

          {/* 소제목 */}
          <div style={{
            fontSize: 8,
            color: 'rgba(255,245,215,0.45)',
            letterSpacing: '0.18em',
            fontFamily: 'serif',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            marginTop: 8,
          }}>
            ♦ 과목 궁합 매칭 시스템 ♦
          </div>

          {/* 중앙 여백 */}
          <div style={{ flex: 1 }} />

          {/* 하단 문구 */}
          <div style={{
            fontSize: 8,
            color: 'rgba(255,245,215,0.42)',
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
