import { useState } from 'react';
import { CLICKBAIT_TITLES, DISTRACTION_CURSES, STUDY_TIPS, getSajuValue } from '../../constants';
import { LoadingPlaceholder } from './CommonPages';

export const SharePage = ({ myData }: any) => {
  const [curseIdx, setCurseIdx] = useState(0);
  const [clickbaitIdx, setClickbaitIdx] = useState(0);

  if (!myData) return <LoadingPlaceholder text="내 사주를 먼저 입력해주세요" />;

  const sv = getSajuValue(myData.saju);
  const tips = [0, 1, 2].map(i => STUDY_TIPS[(sv + i * 4) % STUDY_TIPS.length]);

  const handleCopy = (mode: 'normal' | 'curse') => {
    const text = mode === 'normal'
      ? `[슝슝이 사주] 내 중간고사 운빨은? 지금 확인해보세요! 슝슝! ${window.location.href}`
      : `${CLICKBAIT_TITLES[clickbaitIdx]}\n\n${DISTRACTION_CURSES[curseIdx]}\n\n내 사주 보러가기: ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      alert(mode === 'normal' ? '복사! 친구도 딴짓하게 만드세요 😈' : '저주가 담긴 낚시 링크가 복사되었습니다! 🎣');
    });
  };

  return (
    <div className="w-full h-full page-bg">
      <div className="pt-4 px-4 h-full flex flex-col pr-1">
        <div className="font-serif text-[16px] font-bold text-[#3D1F0A] text-center mb-4 pb-2 border-b-2 border-[#C8A14B]/50 relative after:content-['✦'] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:text-[12px] after:text-[#C8A14B] after:bg-[#FAF3DC] after:px-1">
          마무리 및 공유 (共有)
        </div>

        <div className="bg-[#C8A14B]/10 border-2 border-[#C8A14B]/30 rounded-xl p-3.5 mb-3 shadow-sm">
          <div className="text-[12px] text-[#8B6914] font-bold mb-2 flex items-center gap-2">
            <span>📚</span> 시험공부 팁 (Study Tips)
          </div>
          <ul className="text-[11px] text-[#3D1F0A] space-y-1.5 list-disc pl-4 font-medium">
            {tips.map(([before, highlight, after], i) => (
              <li key={i}>{before} <span className="text-[#8B1A1A]">{highlight}</span>{after}</li>
            ))}
          </ul>
          <p className="text-[9px] text-[#A09060] italic mt-2 text-right">* 이 가이드는 과학적 근거가 전혀 없습니다.</p>
        </div>

        <div className="bg-[#8B1A1A]/5 border-2 border-[#8B1A1A]/30 rounded-xl p-3.5 mb-3 shadow-sm">
          <div className="text-[12px] text-[#8B1A1A] font-bold mb-2 flex items-center gap-2">
            <span>😈</span> 딴짓 저주 (Fishing Curse)
          </div>
          <div className="space-y-2.5">
            <div className="text-[10px] text-[#5C1608] leading-relaxed">
              친구에게 낚시 링크를 보내 공부를 방해하시오.<br />
              상대방의 집중력을 뺏어오는 것이 최고의 전략이오.
            </div>
            <div className="space-y-2">
              {[
                { label: '낚시 제목', items: CLICKBAIT_TITLES, val: clickbaitIdx, set: setClickbaitIdx },
                { label: '저주 내용', items: DISTRACTION_CURSES, val: curseIdx, set: setCurseIdx },
              ].map(({ label, items, val, set }) => (
                <div key={label}>
                  <div className="text-[9px] text-[#8B6914] mb-1 font-bold">{label}</div>
                  <select value={val} onChange={e => set(parseInt(e.target.value))}
                    className="w-full p-1.5 border-2 border-[#C8A860] rounded-lg bg-[#FFFBF0] text-[13px] text-[#3D1F0A] focus:outline-none focus:border-[#8B1A1A]">
                    {items.map((t, i) => <option key={i} value={i}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button onClick={() => handleCopy('curse')}
              className="w-full p-2.5 bg-[#8B1A1A] text-[#FFD700] rounded-lg text-[13px] font-bold hover:bg-[#6B0A0A] transition-all shadow-md active:scale-95">
              🎣 낚시 저주 링크 복사
            </button>
          </div>
        </div>
        <div className="text-[10px] text-[#5C1608] italic opacity-70 text-center font-medium">
          ※ 낚시 성공 시 당신의 학점 운이 0.1% 상승할지도 모릅니다.
        </div>
      </div>
    </div>
  );
};
