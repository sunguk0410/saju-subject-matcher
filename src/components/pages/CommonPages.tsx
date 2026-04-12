import { motion } from 'motion/react';

export const CoverPage = () => (
  <div
    className="w-full h-full flex items-center justify-center"
    style={{ background: '#3D200A', fontFamily: "'Noto Serif KR', serif" }}
  >
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none"
      style={{ padding: '18px 16px' }}>

      {/* 이중 테두리 */}
      <div className="absolute pointer-events-none"
        style={{ inset: 10, border: '1.5px solid rgba(200,161,75,0.55)' }} />
      <div className="absolute pointer-events-none"
        style={{ inset: 14, border: '1px solid rgba(200,161,75,0.25)' }} />

      {/* 상단 텍스트 */}
      <div style={{
        color: '#C8A14B', fontSize: 11, letterSpacing: '0.24em',
        fontWeight: 600, marginTop: 16,
      }}>
        ♦ 과목 궁합 길잡이 ♦
      </div>

      {/* 메인 제목 */}
      <div className="flex flex-col items-center" style={{ gap: 10 }}>
        {/* 八字大學 */}
        <div style={{
          color: '#F0E2C0',
          fontSize: 'clamp(52px, 10vw, 80px)',
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          fontFamily: 'serif',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          八字大學
        </div>

        {/* 구분선 */}
        <div style={{
          width: 120, height: 1,
          background: 'linear-gradient(to right, transparent, rgba(200,161,75,0.6), transparent)',
          margin: '2px 0',
        }} />

        {/* 팔자대학 */}
        <div style={{
          color: '#C8A878',
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '0.45em',
        }}>
          팔자대학
        </div>
      </div>

      {/* 하단 텍스트 */}
      <div style={{
        color: '#9A7840', fontSize: 10, letterSpacing: '0.18em',
        fontWeight: 500, marginBottom: 16,
      }}>
        시험은 전략, 합격은 천기
      </div>
    </div>
  </div>
);

export const FinPage = () => (
  <div className="w-full h-full page-bg">
    <div className="h-full w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden rounded-r-xl">
      
      {/* 숭멋사 로고 배경 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          style={{
            width: 370,
            height: 370,
            backgroundImage: "url('/숭멋사로고.png')",
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            opacity: 0.1,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="font-serif text-[20px] font-bold text-[#3D1F0A] text-center mb-8 pb-3 border-b-2 border-[#8B1A1A]/40 tracking-[4px] w-[80%]">
          끝맺음 (終)
        </div>
        <div className="text-[15px] text-[#3D1F0A] leading-loose text-center mb-10 font-serif italic font-bold drop-shadow-sm px-4">
          이제 사주도 봤으니<br />공부를 해야 하지 않겠느냐.<br /><br />하지만 운명이란 것은...<br />어차피 정해져 있다고 하니<br />마지막까지 최선을 다해보시오.<br /><br />— 멋사도사 —
        </div>
      </div>
    </div>
  </div>
);

export const LoadingPlaceholder = ({ text = "사주 입력 후 공개됩니다" }: { text?: string }) => (
  <div className="w-full h-full page-bg">
    <div className="flex flex-col items-center justify-center h-full py-12">
      <motion.img
        src="https://ssu.ac.kr/wp-content/uploads/2020/03/%EC%8A%AC%EC%8A%AC%EC%9D%B4.png"
        alt="슝슝이"
        className="w-20 h-20 object-contain mb-4 opacity-50"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        crossOrigin="anonymous"
      />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-[#8B4513]"
          />
        ))}
      </div>
      <div className="text-[14px] text-[#8B6914] tracking-[4px] font-bold uppercase">{text}</div>
    </div>
  </div>
);
