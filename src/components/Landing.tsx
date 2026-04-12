import { motion } from 'motion/react';
import { useState } from 'react';

interface LandingProps {
  onOpen: () => void;
}

// 책 치수
const W = 240;   // 앞표지 너비
const H = 340;   // 앞표지 높이
const D = 34;    // 두께 (척추/페이지 단면 너비)

export default function Landing({ onOpen }: LandingProps) {
  const [hovered, setHovered] = useState(false);

  const bookStyle: React.CSSProperties = {
    width: W,
    height: H,
    position: 'relative',
    transformStyle: 'preserve-3d',
    transform: hovered
      ? 'rotateX(8deg) rotateY(-18deg) translateY(-10px)'
      : 'rotateX(8deg) rotateY(-32deg)',
    transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
    cursor: 'pointer',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-8 z-10 w-full select-none"
    >
      {/* 원근감 래퍼 */}
      <div style={{ perspective: '1100px', perspectiveOrigin: '50% 40%' }}>
        {/* 책 */}
        <div
          style={bookStyle}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onOpen}
        >

          {/* ── 앞표지 ── */}
          <div style={{
            position: 'absolute',
            width: W, height: H,
            background: 'linear-gradient(155deg, #7A3B1E 0%, #5C2A0F 55%, #6B3219 100%)',
            transform: `translateZ(${D / 2}px)`,
            backfaceVisibility: 'hidden',
            borderRadius: '2px 8px 8px 2px',
            overflow: 'hidden',
            boxShadow: 'inset -8px 0 16px rgba(0,0,0,0.25)',
          }}>
            {/* 나뭇결 패턴 */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'repeating-linear-gradient(168deg, transparent, transparent 5px, rgba(0,0,0,0.8) 5px, rgba(0,0,0,0.8) 6px)',
            }} />

            {/* 안쪽 테두리 프레임 */}
            <div style={{
              position: 'absolute',
              top: 13, right: 13, bottom: 13, left: 13,
              border: '1px solid rgba(255,245,215,0.42)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 10px',
            }}>
              {/* 상단 소제목 */}
              <div style={{
                fontSize: 9.5,
                color: 'rgba(255,245,215,0.68)',
                letterSpacing: '0.25em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                ♦ 과목 궁합 매칭 시스템 ♦
              </div>

              {/* 메인 타이틀 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  fontSize: 50,
                  fontWeight: 700,
                  fontFamily: 'serif',
                  color: 'rgba(255,248,225,0.97)',
                  letterSpacing: '0.1em',
                  lineHeight: 1,
                  textShadow: '0 2px 16px rgba(0,0,0,0.55)',
                }}>
                  八字大學
                </div>
                <div style={{
                  fontSize: 13,
                  fontFamily: 'serif',
                  color: 'rgba(255,245,215,0.62)',
                  letterSpacing: '0.55em',
                }}>
                  팔 자 대 학
                </div>
              </div>

              {/* 하단 문구 */}
              <div style={{
                fontSize: 8.5,
                color: 'rgba(255,245,215,0.48)',
                letterSpacing: '0.22em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                시험은 전략, 합격은 천기
              </div>
            </div>

            {/* 척추쪽 안쪽 그림자 */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 20,
              background: 'linear-gradient(to right, rgba(0,0,0,0.38), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* ── 뒤표지 ── */}
          <div style={{
            position: 'absolute',
            width: W, height: H,
            background: '#3E1608',
            transform: `translateZ(${-D / 2}px)`,
            backfaceVisibility: 'hidden',
            borderRadius: '8px 2px 2px 8px',
          }} />

          {/* ── 척추 (왼쪽 면) ── */}
          <div style={{
            position: 'absolute',
            width: D, height: H,
            left: 0,
            background: 'linear-gradient(to right, #1C0703, #5E2810, #1C0703)',
            transformOrigin: 'left center',
            transform: 'rotateY(-90deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              writingMode: 'vertical-rl',
              fontFamily: 'serif',
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,220,120,0.75)',
              letterSpacing: '0.3em',
            }}>
              八字大學
            </div>
          </div>

          {/* ── 페이지 단면 (오른쪽 면) ── */}
          <div style={{
            position: 'absolute',
            width: D, height: H,
            right: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, #F7ECD2, #F7ECD2 1.2px, #E4D3AC 1.2px, #E4D3AC 2.4px)',
            transformOrigin: 'right center',
            transform: 'rotateY(90deg)',
            borderLeft: '1px solid rgba(0,0,0,0.12)',
          }} />

          {/* ── 상단면 ── */}
          <div style={{
            position: 'absolute',
            width: W, height: D,
            top: 0, left: 0,
            background: 'linear-gradient(to bottom, #EDE0C2, #D6C89A)',
            transformOrigin: 'top center',
            transform: 'rotateX(90deg)',
          }} />

          {/* ── 하단면 ── */}
          <div style={{
            position: 'absolute',
            width: W, height: D,
            bottom: 0, left: 0,
            background: 'linear-gradient(to top, #C8B87C, #D6C89A)',
            transformOrigin: 'bottom center',
            transform: 'rotateX(-90deg)',
          }} />

        </div>
      </div>

      {/* 바닥 그림자 (책 아래) */}
      <div style={{
        width: 180,
        height: 16,
        marginTop: -6,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%)',
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
