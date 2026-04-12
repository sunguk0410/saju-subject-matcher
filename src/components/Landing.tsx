import { motion } from 'motion/react';

interface LandingProps {
  onOpen: () => void;
}

export default function Landing({ onOpen }: LandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center p-8 z-10 w-full"
    >
      {/* 3D 책 버튼 */}
      <button
        onClick={onOpen}
        className="group cursor-pointer"
        style={{ perspective: '1200px' }}
      >
        {/* 책 컨테이너 — 호버 시 살짝 들어올려짐 */}
        <motion.div
          animate={{ rotateY: -28, rotateX: 6 }}
          whileHover={{ rotateY: -16, rotateX: 4, y: -12, transition: { duration: 0.4, ease: 'easeOut' } }}
          transition={{ duration: 0 }}
          style={{
            width: 260,
            height: 360,
            position: 'relative',
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.75))',
          }}
        >

          {/* ── 앞표지 ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, #7A3B1E 0%, #5C2A0F 50%, #6B3219 100%)',
            borderRadius: '2px 10px 10px 2px',
            transform: 'translateZ(18px)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}>
            {/* 미묘한 나뭇결 텍스처 */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.07,
              backgroundImage: 'repeating-linear-gradient(170deg, transparent, transparent 6px, rgba(0,0,0,0.6) 6px, rgba(0,0,0,0.6) 7px)',
            }} />

            {/* 내부 테두리 프레임 */}
            <div style={{
              position: 'absolute',
              top: 14, right: 14, bottom: 14, left: 14,
              border: '1px solid rgba(255,245,220,0.45)',
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 12px',
            }}>
              {/* 상단 소제목 */}
              <div style={{
                fontSize: 10,
                color: 'rgba(255,245,220,0.7)',
                letterSpacing: '0.22em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                ♦ 과목 궁합 매칭 시스템 ♦
              </div>

              {/* 메인 타이틀 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  fontSize: 52,
                  fontWeight: 700,
                  fontFamily: 'serif',
                  color: 'rgba(255,248,225,0.97)',
                  letterSpacing: '0.12em',
                  lineHeight: 1,
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}>
                  八字大學
                </div>
                <div style={{
                  fontSize: 14,
                  fontFamily: 'serif',
                  color: 'rgba(255,245,220,0.65)',
                  letterSpacing: '0.5em',
                  marginTop: 2,
                }}>
                  팔 자 대 학
                </div>
              </div>

              {/* 하단 문구 */}
              <div style={{
                fontSize: 9,
                color: 'rgba(255,245,220,0.5)',
                letterSpacing: '0.2em',
                fontFamily: 'serif',
                textAlign: 'center',
              }}>
                시험은 전략, 합격은 천기
              </div>
            </div>

            {/* 제본부 안쪽 그림자 */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
              background: 'linear-gradient(to right, rgba(0,0,0,0.35), transparent)',
              pointerEvents: 'none',
            }} />
          </div>

          {/* ── 뒤표지 ── */}
          <div style={{
            position: 'absolute', inset: 0,
            background: '#4A1E08',
            borderRadius: '10px 2px 2px 10px',
            transform: 'translateZ(-18px)',
            backfaceVisibility: 'hidden',
          }} />

          {/* ── 척추(등) ── */}
          <div style={{
            position: 'absolute',
            width: 36,
            height: '100%',
            left: 0,
            background: 'linear-gradient(to right, #1E0803, #6B2C10, #3D1205)',
            transform: 'rotateY(-90deg) translateZ(0px)',
            transformOrigin: 'left center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid rgba(0,0,0,0.4)',
          }}>
            <div style={{
              fontFamily: 'serif',
              fontSize: 11,
              color: 'rgba(255,220,130,0.8)',
              letterSpacing: '0.3em',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontWeight: 700,
            }}>
              八字大學
            </div>
          </div>

          {/* ── 페이지 단면 (오른쪽) ── */}
          <div style={{
            position: 'absolute',
            width: 36,
            height: '100%',
            right: 0,
            transformOrigin: 'right center',
            transform: 'rotateY(90deg) translateZ(0px)',
            backgroundImage: 'repeating-linear-gradient(0deg, #F8EDD4, #F8EDD4 1.5px, #E8D8B4 1.5px, #E8D8B4 3px)',
            borderLeft: '1px solid rgba(0,0,0,0.15)',
          }} />

          {/* ── 상단면 ── */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: 36,
            top: 0,
            transformOrigin: 'top center',
            transform: 'rotateX(90deg) translateZ(0px)',
            background: 'linear-gradient(to bottom, #EDE0C4, #D8C89A)',
          }} />

          {/* ── 하단면 ── */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: 36,
            bottom: 0,
            transformOrigin: 'bottom center',
            transform: 'rotateX(-90deg) translateZ(0px)',
            background: 'linear-gradient(to top, #D8C89A, #C8B880)',
          }} />

          {/* 바닥 그림자 */}
          <div style={{
            position: 'absolute',
            bottom: -30,
            left: '5%',
            width: '90%',
            height: 30,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 75%)',
            transform: 'translateZ(-18px)',
            filter: 'blur(8px)',
          }} />
        </motion.div>
      </button>

      <motion.div
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[#C8A14B] text-[13px] mt-12 tracking-[2px] font-serif"
      >
        📖 클릭하는 순간 당신의 운명이 펼쳐집니다
      </motion.div>
    </motion.div>
  );
}
