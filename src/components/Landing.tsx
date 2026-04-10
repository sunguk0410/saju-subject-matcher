import { motion } from 'motion/react';

interface LandingProps {
  onOpen: () => void;
}

export default function Landing({ onOpen }: LandingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 z-10 w-full"
    >
      <div className="text-[#C8A14B] font-serif text-base tracking-[5px] mb-1">✦ 궁합 매칭 시스템 ✦</div>
      <div className="text-[#5C4020] text-[12px] tracking-[2px] mb-12 uppercase">중간고사 사주 궁합 특별판 · 八字大學</div>

      <button
        onClick={onOpen}
        className="group relative perspective-[1200px] cursor-pointer"
      >
        <div className="flex items-center justify-center">
          {/* 3D Closed Book (Enlarged) */}
          <div className="w-[300px] h-[400px] relative preserve-3d transition-transform duration-500 ease-out group-hover:rotate-y-[-20deg] group-hover:rotate-x-[5deg] group-hover:-translate-y-4 rotate-y-[-30deg] rotate-x-[5deg]">
            {/* Front Cover */}
            <div className="absolute inset-0 bg-[#6B1A08] rounded-[2px_12px_12px_2px] translate-z-[20px] overflow-hidden backface-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
              {/* Wood Texture Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 2px, transparent 2px, transparent 4px)' }} />
              
              <div className="absolute inset-[15px] border-2 border-[#C8A14B] rounded-[6px] flex flex-col items-center justify-center text-center p-4 bg-black/20">
                <div className="absolute inset-1 border border-[#C8A14B]/40 rounded-[3px] pointer-events-none" />
                
                {/* Corner Ornaments */}
                <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-[#C8A14B]" />
                <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-[#C8A14B]" />
                <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-[#C8A14B]" />
                <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-[#C8A14B]" />

                <div className="text-[13px] text-[#C8A14B] tracking-[5px] font-serif mb-4 uppercase font-bold">✦ 秘傳 ✦</div>
                <div className="font-serif text-[42px] text-[#FFD888] tracking-[8px] mb-2 drop-shadow-lg">八字大學</div>
                <div className="font-serif text-[22px] text-[#E8B84B] leading-tight mb-4 italic">중간고사<br/>운빨 전략</div>
                <div className="w-[80%] h-0.5 bg-gradient-to-r from-transparent via-[#C8A14B] to-transparent my-4 mx-auto" />
                <div className="text-[12px] text-[#C8A14B] tracking-[3px] font-medium">사주 매칭 시스템</div>

                {/* Seal */}
                <div className="mt-6 w-14 h-14 border-2 border-[#8B1A1A] rounded-sm flex items-center justify-center rotate-12 bg-[#8B1A1A]/10">
                  <span className="text-[11px] text-[#8B1A1A] font-bold leading-none">운빨<br/>認定</span>
                </div>
              </div>
            </div>
            {/* Back Cover */}
            <div className="absolute inset-0 bg-[#5A1506] rounded-[12px_2px_2px_12px] -translate-z-[20px] rotate-y-180 backface-hidden" />
            {/* Spine */}
            <div className="absolute w-[40px] h-full bg-gradient-to-r from-[#2E0A02] via-[#7A2010] to-[#2E0A02] rotate-y-[-90deg] left-0 origin-left flex items-center justify-center border-r border-black/30">
              <div className="font-serif text-[12px] text-[#FFD888] vertical-rl tracking-[4px] font-bold">슝슝이 사주풀이</div>
            </div>
            {/* Pages (Right Edge) */}
            <div className="absolute w-[40px] h-full bg-[repeating-linear-gradient(0deg,#F5ECD4,#F5ECD4_1px,#E2D4AF_1px,#E2D4AF_2px)] rotate-y-[90deg] translate-z-[300px] origin-left border-l border-black/20" />
            {/* Top Edge */}
            <div className="absolute w-[300px] h-[40px] bg-[#EFE2C5] rotate-x-[90deg] top-0 left-0 origin-top" />
            {/* Bottom Edge */}
            <div className="absolute w-[300px] h-[40px] bg-[#DDD0AB] -rotate-x-[90deg] bottom-0 left-0 origin-bottom" />
          </div>
        </div>
      </button>

      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-[#C8A14B] text-[13px] mt-12 tracking-[1px]"
      >
        📖 클릭하는 순간 당신의 운명이 펼쳐집니다.
      </motion.div>
    </motion.div>
  );
}
