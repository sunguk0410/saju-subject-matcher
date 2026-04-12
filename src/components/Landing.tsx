import { motion } from 'motion/react';
import { useState } from 'react';

interface LandingProps {
  onOpen: () => void;
}

export default function Landing({ onOpen }: LandingProps) {
  const [hovered, setHovered] = useState(false);

  const rotateY = hovered ? -14 : -28;
  const lift = hovered ? -12 : 0;

  // 책 치수
  const W = 220;
  const H = 310;
  const SPINE = 32;  // 척추 두께
  const PAGE  = 28;  // 페이지 단면 두께


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-8 z-10 w-full select-none"
    >
      {/* 클릭 영역 */}
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
      >
        {/* ── 책 전체 래퍼 (perspective 적용) ─────────────── */}
        <div
          style={{
            perspective: '900px',
            perspectiveOrigin: '50% 45%',
            display: 'flex',
            alignItems: 'flex-start',
            transition: `transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)`,
            transform: `translateY(${lift}px)`,
          }}
        >
          {/* ── 척추 면 (앞표지 왼쪽) ─────────────── */}
          <div
            style={{
              width: SPINE,
              height: H,
              flexShrink: 0,
              background: 'linear-gradient(to right, #150502, #5C2810, #150502)',
              transformOrigin: 'right center',
              transform: `rotateY(${90 + rotateY}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}
          >
            <span style={{
              writingMode: 'vertical-rl',
              fontFamily: 'serif',
              fontSize: 10,
              fontWeight: 700,
              color: 'rgba(255,215,100,0.7)',
              letterSpacing: '0.35em',
            }}>八字大學</span>
          </div>

          {/* ── 앞표지 ─────────────── */}
          <div
            style={{
              width: W,
              height: H,
              flexShrink: 0,
              transformOrigin: 'left center',
              transform: `rotateY(${rotateY}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
              background: 'linear-gradient(155deg, #7A3B1E 0%, #5C2A0F 55%, #6B3219 100%)',
              borderRadius: '1px 8px 8px 1px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '4px 8px 40px rgba(0,0,0,0.7), inset -6px 0 14px rgba(0,0,0,0.3)',
            }}
          >
            {/* 나뭇결 패턴 */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.055,
              backgroundImage: 'repeating-linear-gradient(168deg, transparent, transparent 5px, rgba(0,0,0,0.9) 5px, rgba(0,0,0,0.9) 6px)',
              pointerEvents: 'none',
            }} />

            {/* 내부 테두리 프레임 */}
            <div style={{
              position: 'absolute',
              top: 13, right: 13, bottom: 13, left: 13,
              border: '1px solid rgba(255,245,215,0.40)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 10px',
              pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 9,
                color: 'rgba(255,245,215,0.65)',
                letterSpacing: '0.25em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                ♦ 과목 궁합 매칭 시스템 ♦
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{
                  fontSize: 46,
                  fontWeight: 700,
                  fontFamily: 'serif',
                  color: 'rgba(255,248,225,0.97)',
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  textShadow: '0 2px 14px rgba(0,0,0,0.6)',
                }}>
                  八字大學
                </div>
                <div style={{
                  fontSize: 12,
                  fontFamily: 'serif',
                  color: 'rgba(255,245,215,0.60)',
                  letterSpacing: '0.55em',
                }}>
                  팔 자 대 학
                </div>
              </div>

              <div style={{
                fontSize: 8,
                color: 'rgba(255,245,215,0.45)',
                letterSpacing: '0.22em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                시험은 전략, 합격은 천기
              </div>
            </div>

            {/* 제본부 안쪽 그림자 */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
              background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* ── 페이지 단면 (앞표지 오른쪽) ─────────────── */}
          <div
            style={{
              width: PAGE,
              height: H,
              flexShrink: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, #F5EAD0, #F5EAD0 1px, #E0CFA8 1px, #E0CFA8 2px)',
              transformOrigin: 'left center',
              transform: `rotateY(${90 + rotateY}deg)`,
              transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
              borderLeft: '1px solid rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* 바닥 그림자 */}
        <div style={{
          position: 'absolute',
          bottom: -14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75%',
          height: 14,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          filter: 'blur(5px)',
          pointerEvents: 'none',
        }} />
      </div>

      <motion.div
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[#C8A14B] text-[13px] mt-10 tracking-[2px] font-serif"
      >
        📖 클릭하는 순간 당신의 운명이 펼쳐집니다
      </motion.div>
    </motion.div>
  );
}
