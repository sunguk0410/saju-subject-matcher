import { motion } from 'motion/react';

export const CoverPage = () => (
  <div className="w-full h-full flex justify-center page-bg">
    <div className="relative" style={{ width: 413, height: 646, fontFamily: "'Noto Serif KR', serif", flexShrink: 0 }}>

      {/* 숭멋사 로고 배경 */}
      <div className="absolute pointer-events-none" style={{
        width: 350, height: 350, left: 30, top: 150,
        backgroundImage: "url('/숭멋사로고.png')",
        backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
        opacity: 0.12,
      }} />

      {/* ♦︎과목 궁합 매칭 시스템♦ */}
      <div className="absolute" style={{
        width: 189, height: 19, left: 135, top: 72,
        fontWeight: 600, fontSize: 13, lineHeight: '19px',
        letterSpacing: '0.22em', color: '#8E5818',
      }}>
        ♦︎과목 궁합 길잡이♦
      </div>

      {/* 八字大學 */}
      <div className="absolute" style={{
        width: 264, height: 95, left: 75, top: 199,
        fontWeight: 700, fontSize: 66, lineHeight: '95px',
        color: '#54320A',
      }}>
        八字大學
      </div>

      {/* 중간고사 운빨 전략 */}
      <div className="absolute" style={{
        width: 181, height: 32, left: 116, top: 297,
        fontWeight: 600, fontSize: 22, lineHeight: '32px',
        letterSpacing: '-0.03em', color: '#54320A',
      }}>
        중간고사 운빨 전략
      </div>

      {/* 태어난 기운과 과목의 오행을 분석하여... */}
      <div className="absolute text-center" style={{
        width: 316, left: 49, top: 365,
        fontWeight: 600, fontSize: 15, lineHeight: '26px',
        letterSpacing: '-0.03em', color: '#54320A',
      }}>
        당신의 기운과 과목의 조화를 분석하여,<br />시험운을 극대화할 길잡이가 되어드립니다.
      </div>

      {/* 시험은 전략, 합격은 천기 */}
      <div className="absolute" style={{
        width: 104, left: 155, top: 574,
        fontWeight: 600, fontSize: 10, lineHeight: '14px',
        letterSpacing: '-0.03em', color: '#8E5818',
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
