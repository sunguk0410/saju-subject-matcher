import { motion } from 'motion/react';

const CX = 150, CY = 150;
const rp = (deg: number, r: number): [number, number] => {
  const rad = (deg - 90) * Math.PI / 180;
  return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
};

const DIZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const TG12   = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸','甲','乙'];
const WX12   = ['木','木','火','火','土','土','金','金','水','水','木','木'];
const YY12   = ['陽','陰','陽','陰','陽','陰','陽','陰','陽','陰','陽','陰'];

const SajuWheel = () => (
  <svg viewBox="0 0 300 300" className="w-48 h-48" style={{ filter: 'drop-shadow(1px 3px 6px rgba(0,0,0,0.35))' }}>
    <defs>
      <radialGradient id="wbg" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#FDF2D4" />
        <stop offset="65%"  stopColor="#EDD89A" />
        <stop offset="100%" stopColor="#C9A55E" />
      </radialGradient>
    </defs>

    {/* 배경 */}
    <rect width="300" height="300" fill="url(#wbg)" rx="6" />

    {/* 동심원 */}
    {[133,120,107,94,80,66,52,40].map((r, i) => (
      <circle key={r} cx={CX} cy={CY} r={r} fill="none"
        stroke="#5C3010" strokeWidth={i === 0 ? 1.6 : 0.65} />
    ))}

    {/* 12 주요 방사선 (r=40 → r=133) */}
    {Array.from({ length: 12 }, (_, i) => {
      const [x1, y1] = rp(i * 30, 40);
      const [x2, y2] = rp(i * 30, 133);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5C3010" strokeWidth="0.65" />;
    })}

    {/* 가장 바깥 링(120‒133): 30개 날짜 숫자 + 30개 보조 방사선 */}
    {Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * 360;
      const mid   = angle + 6;
      const [x, y]     = rp(mid, 126);
      const [lx1, ly1] = rp(angle, 120);
      const [lx2, ly2] = rp(angle, 133);
      return (
        <g key={i}>
          <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke="#5C3010" strokeWidth="0.4" />
          <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            fontSize="6.5" fontFamily="serif" fill="#3D1F0A"
            transform={`rotate(${mid},${x},${y})`}>
            {i + 1}
          </text>
        </g>
      );
    })}

    {/* 링 107‒120: 天干 반복 */}
    {TG12.map((c, i) => {
      const a = i * 30 + 15;
      const [x, y] = rp(a, 113);
      return (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontFamily="serif" fill="#3D1F0A"
          transform={`rotate(${a},${x},${y})`}>{c}</text>
      );
    })}

    {/* 링 94‒107: 地支 (진하게) */}
    {DIZHI.map((c, i) => {
      const a = i * 30 + 15;
      const [x, y] = rp(a, 100);
      return (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontFamily="serif" fill="#3D1F0A" fontWeight="bold"
          transform={`rotate(${a},${x},${y})`}>{c}</text>
      );
    })}

    {/* 링 80‒94: 天干 (붉은색) */}
    {TG12.map((c, i) => {
      const a = i * 30 + 15;
      const [x, y] = rp(a, 87);
      return (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="8.5" fontFamily="serif" fill="#8B1A1A"
          transform={`rotate(${a},${x},${y})`}>{c}</text>
      );
    })}

    {/* 링 66‒80: 五行 (초록) */}
    {WX12.map((c, i) => {
      const a = i * 30 + 15;
      const [x, y] = rp(a, 73);
      return (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="8" fontFamily="serif" fill="#1E4D1E"
          transform={`rotate(${a},${x},${y})`}>{c}</text>
      );
    })}

    {/* 링 52‒66: 陰陽 */}
    {YY12.map((c, i) => {
      const a = i * 30 + 15;
      const [x, y] = rp(a, 59);
      return (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="7" fontFamily="serif" fill="#5C3010"
          transform={`rotate(${a},${x},${y})`}>{c}</text>
      );
    })}

    {/* 중앙 채운 원 */}
    <circle cx={CX} cy={CY} r={40} fill="#EDD89A" stroke="#5C3010" strokeWidth="1.6" />

    {/* 중앙 텍스트 */}
    <text x={CX} y={CY - 8} textAnchor="middle" dominantBaseline="middle"
      fontSize="12" fontFamily="serif" fill="#3D1F0A" fontWeight="bold" letterSpacing="1">甲子年</text>
    <text x={CX} y={CY + 9} textAnchor="middle" dominantBaseline="middle"
      fontSize="12" fontFamily="serif" fill="#3D1F0A" fontWeight="bold" letterSpacing="1">正月</text>
  </svg>
);

export const CoverPage = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-4 w-full">
    <div className="text-[11px] text-[#8B6914] tracking-[5px] font-serif mb-2">✦ 궁합 매칭 시스템 ✦</div>
    <div className="font-serif text-[40px] text-[#3D1F0A] tracking-[7px] mb-1">八字大學</div>
    <div className="font-serif text-[16px] text-[#5C3010] tracking-[3px] mb-3">중간고사 사주 궁합</div>
    <div className="w-full h-px bg-[#C8A14B] opacity-60 mb-3" />

    <div className="flex justify-center my-2 w-full">
      <SajuWheel />
    </div>

    <div className="w-full h-px bg-[#C8A14B] opacity-60 mt-3 mb-3" />
    <div className="bg-[#8B1A1A]/5 border border-dashed border-[#8B1A1A]/40 rounded-md p-4 text-[12px] text-[#5C1608] italic leading-relaxed w-full shadow-inner">
      태어난 기운과 과목의 오행을 분석하여<br />최적의 시험 전략을 제안하는 시스템입니다.
    </div>
    <div className="text-[11px] text-[#8B6914] mt-4 tracking-widest font-bold">중간고사 운빨 전략 특별판</div>
  </div>
);

export const FinPage = () => (
  <div className="h-full w-full flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden rounded-r-xl">
    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
      <div className="w-[400px] h-[400px] border-[20px] border-[#3D1F0A] rounded-full flex items-center justify-center">
        <div className="w-[300px] h-[300px] border-[10px] border-[#3D1F0A] rounded-full flex items-center justify-center">
          <div className="w-[200px] h-[200px] border-[5px] border-[#3D1F0A] rounded-full" />
        </div>
      </div>
    </div>

    <div className="relative z-10 flex flex-col items-center w-full">
      <div className="font-serif text-[20px] font-bold text-[#3D1F0A] text-center mb-8 pb-3 border-b-2 border-[#8B1A1A]/40 tracking-[4px] w-[80%]">
        끝맺음 (終)
      </div>
      <div className="text-[15px] text-[#3D1F0A] leading-loose text-center mb-10 font-serif italic font-bold drop-shadow-sm px-4">
        이제 사주도 봤으니<br />공부를 해야 하지 않겠느냐.<br /><br />하지만 운명이란 것은...<br />어차피 정해져 있다고 하니<br />마지막까지 최선을 다해보시오.
      </div>
      <div className="bg-[#8B1A1A]/10 border-2 border-dashed border-[#8B1A1A]/40 rounded-xl px-6 py-3 text-[14px] text-[#5C1608] italic font-serif font-bold shadow-lg backdrop-blur-sm">
        — 멋사도사 —
      </div>
    </div>
  </div>
);

export const LoadingPlaceholder = ({ text = "사주 입력 후 공개됩니다" }: { text?: string }) => (
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
);
