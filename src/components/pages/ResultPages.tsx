import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { UserData } from '../../types';
import {
  getSajuValue, getFiveElements, pick,
  OHC, OHK, SajuPillar,
  BYEONGMAT_COMMENTS
} from '../../constants';
import { LoadingPlaceholder } from './CommonPages';
import { fetchAiFortune } from '../../lib/utils';

export const MyResult1 = ({ myData, aiFortune, setAiFortune, onSave }: any) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!myData || aiFortune || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoadingAi(true);
    fetchAiFortune(myData).then(fortune => {
      setAiFortune(fortune);
      setLoadingAi(false);
    });
  }, [myData, aiFortune]);

  if (!myData) return <LoadingPlaceholder text="사주 입력 후 공개됩니다" />;
  const s = myData.saju;
  const sv = getSajuValue(s);
  const elements = getFiveElements(s);

  const pentagonPoints = [
    { label: '목', key: '목', x: 100, y: 20 },
    { label: '화', key: '화', x: 180, y: 80 },
    { label: '토', key: '토', x: 150, y: 170 },
    { label: '금', key: '금', x: 50, y: 170 },
    { label: '수', key: '수', x: 20, y: 80 },
  ];

  const polygonPath = pentagonPoints.map((p) => {
    const val = elements[p.key] || 0;
    const ratio = (val / 8) * 0.8 + 0.2;
    const dx = p.x - 100, dy = p.y - 100;
    return `${100 + dx * ratio},${100 + dy * ratio}`;
  }).join(' ');

  return (
    <div className="pt-4 px-4" id="my-result-1">
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1 text-center font-serif text-[16px] font-bold text-[#3D1F0A]">{myData.name}의 사주</div>
        <button onClick={(e) => { e.stopPropagation(); onSave(); }}
          className="p-1.5 bg-[#C8A14B]/20 rounded-md hover:bg-[#C8A14B]/40 transition-colors text-[10px] text-[#8B6914] font-bold border border-[#C8A14B]/30">
          💾 저장
        </button>
      </div>
      <div className="text-[11px] text-[#8B6914] text-center mb-2">
        {new Date(myData.date).getFullYear()}년생 · {s.zodiac}띠
      </div>

      <div className="bg-[#8B1A1A]/10 border-2 border-[#8B1A1A]/30 rounded-xl p-3 mb-3 shadow-sm">
        <div className="text-[10px] text-[#8B1A1A] font-bold mb-1 flex items-center gap-2">
          <span className="text-base">🤖</span> 사주 한줄 요약
        </div>
        <div className="text-[13px] text-[#3D1F0A] italic leading-relaxed min-h-[30px] flex items-center font-medium">
          {loadingAi ? (
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block text-base"
              >
                🌀
              </motion.span>
              <span className="text-[11px]">미래를 분석하는 중...</span>
            </div>
          ) : (
            <span>{aiFortune || '분석 결과가 없습니다.'}</span>
          )}
        </div>
      </div>

      <div className="text-[10px] text-[#8B6914] font-bold mb-1 uppercase tracking-wider">사주 팔자 (四柱八字)</div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {(['year', 'month', 'day', 'hour'] as const).map((k, i) => {
          const pillar = s[k] as SajuPillar;
          return (
            <div key={k} className="text-center bg-white border-2 border-[#C8A14B]/30 rounded-lg p-1.5 shadow-sm">
              <div className="text-[18px] font-bold font-serif text-[#003087] leading-tight">{pillar.sky}</div>
              <div className="text-[18px] font-bold font-serif text-[#8B2500] leading-tight">{pillar.earth}</div>
              <div className="text-[9px] text-[#A09060] mt-0.5 font-bold">{['년', '월', '일', '시'][i]}주</div>
            </div>
          );
        })}
      </div>

      <div className="text-[10px] text-[#8B6914] font-bold mb-1 uppercase tracking-wider">오행 분석 (五行分析)</div>
      <div className="flex flex-col items-center bg-white/50 rounded-2xl p-3 border border-[#C8A14B]/20 mb-3">
        <div className="relative w-[150px] h-[150px]">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="100,20 180,80 150,170 50,170 20,80" fill="none" stroke="#C8A14B" strokeWidth="1" strokeDasharray="4,4" className="opacity-30" />
            {[0.25, 0.5, 0.75].map(r => (
              <polygon key={r} points={pentagonPoints.map(p => `${100 + (p.x-100)*r},${100 + (p.y-100)*r}`).join(' ')} fill="none" stroke="#C8A14B" strokeWidth="0.5" className="opacity-20" />
            ))}
            <polygon points={polygonPath} fill="rgba(200, 161, 75, 0.4)" stroke="#8B6914" strokeWidth="2" />
            {pentagonPoints.map(p => (
              <text key={p.label} x={p.x + (p.x > 100 ? 5 : p.x < 100 ? -15 : -5)} y={p.y + (p.y > 100 ? 15 : p.y < 100 ? -5 : -5)} className="text-[14px] font-bold fill-[#3D1F0A]">{p.label}</text>
            ))}
          </svg>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-center mt-2">
          {Object.entries(elements).filter(([, v]) => v > 0).map(([k, v]) => (
            <span key={k} className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${OHC[k]}`}>{OHK[k]} {v}</span>
          ))}
        </div>
      </div>

      <div className="bg-[#8B1A1A]/5 border-l-4 border-[#8B1A1A] p-2.5 rounded-r-lg text-[11px] text-[#5C1608] italic leading-relaxed shadow-sm">
        {pick(BYEONGMAT_COMMENTS, sv)}
      </div>
    </div>
  );
};

export const SubjCompatPage = ({ myData, onSave }: any) => {
  if (!myData) return <LoadingPlaceholder text="과목 입력 후 공개됩니다" />;
  const s = myData.saju;
  const sv = getSajuValue(s);
  const myOh = getFiveElements(s);

  const getSubjOh = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Object.keys(OHK)[hash % Object.keys(OHK).length];
  };

  return (
    <div className="pt-4 px-4 h-full flex flex-col" id="subj-compat">
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1 text-center font-serif text-[16px] font-bold text-[#3D1F0A]">과목별 궁합 분석 (科目宮合)</div>
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="p-1.5 bg-[#C8A14B]/20 rounded-md hover:bg-[#C8A14B]/40 transition-colors text-[10px] text-[#8B6914] font-bold border border-[#C8A14B]/30">💾 저장</button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
        {myData.subjects.map((subj: string, i: number) => {
          const oh = getSubjOh(subj);
          const score = Math.min(99, Math.max(30, 40 + (myOh[oh] || 0) * 12 + (sv + i * 13) % 35));
          const color = score >= 80 ? 'text-[#2E7D32]' : score >= 60 ? 'text-[#C8A14B]' : 'text-[#8B1A1A]';
          return (
            <div key={i} className="bg-white/40 border border-[#C8A14B]/20 rounded-xl p-2.5 shadow-sm">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${OHC[oh]}`}>{OHK[oh]}</span>
                  <span className="text-[13px] font-bold text-[#3D1F0A]">{subj}</span>
                </div>
                <span className={`text-[16px] font-serif font-bold ${color}`}>{score}점</span>
              </div>
              <div className="h-1 bg-[#C8A14B]/10 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: score >= 80 ? '#2E7D32' : score >= 60 ? '#C8A14B' : '#8B1A1A' }} />
              </div>
              <div className="text-[10px] text-[#5C3010] italic leading-tight">
                {score >= 80 ? '이 과목은 당신의 기운과 찰떡궁합! 공부한 만큼 성적이 나올 것이로다.' :
                 score >= 60 ? '무난한 궁합이다. 노력이 배신하지는 않을 것이니 정진하라.' :
                 '기운이 충돌한다! 남들보다 두 배는 더 노력해야 평타라도 칠 것이로다.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
