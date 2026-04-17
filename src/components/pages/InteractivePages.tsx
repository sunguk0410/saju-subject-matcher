import { useState } from 'react';
import { CLICKBAIT_TITLES, DISTRACTION_CURSES, DDAN_JIT_TACTICS, getSajuValue } from '../../constants';
import { LoadingPlaceholder } from './CommonPages';

export const SharePage = ({ myData }: any) => {
  const [curseIdx, setCurseIdx] = useState(0);
  const [clickbaitIdx, setClickbaitIdx] = useState(0);

  if (!myData) return <LoadingPlaceholder text="내 사주를 먼저 입력해주세요" />;

  const sv = getSajuValue(myData.saju);
  const tactic = DDAN_JIT_TACTICS[sv % DDAN_JIT_TACTICS.length];

  const handleCopy = (mode: 'normal' | 'curse') => {
    const text = mode === 'normal'
      ? `[슝슝이 사주] 내 중간고사 운빨은? 지금 확인해보세요! 슝슝! ${window.location.href}`
      : `${CLICKBAIT_TITLES[clickbaitIdx]}\n\n푸하하, 어리석은 학생이여 속았구나!\n지금 당장 아래 링크를 통해 오늘의 운세를 점치지 않으면 이번 시험기간에\n${DISTRACTION_CURSES[curseIdx]}\n\n내 사주 보러가기: ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      alert(mode === 'normal' ? '복사되었느니라. 벗도 이 운명을 마주하게 하라.' : '저주의 서신이 봉인되었느니라. 이제 전달하거라.');
    });
  };

  return (
    <div className="w-full h-full page-bg">
      <div className="pt-4 px-4 h-full flex flex-col pr-1">
        <div className="font-serif text-[16px] font-bold text-[#3D1F0A] text-center mb-2">
          마무리 및 공유 (共有)
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C8A14B]/50" />
          <span className="text-[#C8A14B] text-[11px]">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C8A14B]/50" />
        </div>

        <div className="bg-[#C8A14B]/10 border border-[#C8A14B]/20 rounded-xl p-3.5 mb-3 shadow-md">
          <div className="text-[12px] text-[#8B6914] font-bold mb-2">
            ✦ 시험 기간 딴짓 전략 (雜念戰略)
          </div>
          <p className="text-[12px] text-[#3D1F0A] leading-relaxed font-medium">
            {tactic}
          </p>
          <p className="text-[10px] text-[#A09060] mt-2 text-right">* 본 전략은 오행의 이치에 의거하였으니 실천 여부는 본인 책임이니라.</p>
        </div>

        <div className="bg-[#8B1A1A]/5 border border-[#8B1A1A]/15 rounded-xl p-3.5 mb-3 shadow-md">
          <div className="text-[12px] text-[#8B1A1A] font-bold mb-2">
            ✦ 딴짓 저주 (雜念詛呪)
          </div>
          <div className="space-y-2.5">
            <div className="text-[12px] text-[#5C1608] leading-relaxed">
              벗에게 이 서신을 보내어 그의 공부를 흐트러뜨려라.<br />
              적의 집중 기운을 흩트리는 것이 상책이니라.
            </div>
            <div className="space-y-2">
              {[
                { label: '낚시 제목', items: CLICKBAIT_TITLES, val: clickbaitIdx, set: setClickbaitIdx },
                { label: '저주 내용', items: DISTRACTION_CURSES, val: curseIdx, set: setCurseIdx },
              ].map(({ label, items, val, set }) => (
                <div key={label}>
                  <div className="text-[9px] text-[#8B6914] mb-1 font-bold">{label}</div>
                  <select value={val} onChange={e => set(parseInt(e.target.value))}
                    className="w-full p-1.5 border border-[#C8A860]/50 rounded-lg bg-[#FFFBF0] text-[13px] text-[#3D1F0A] focus:outline-none focus:border-[#8B1A1A] shadow-sm">
                    {items.map((t, i) => <option key={i} value={i}>{t}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <button onClick={() => handleCopy('curse')}
              className="w-full p-2.5 bg-[#8B1A1A] text-[#FFD700] rounded-lg text-[13px] font-bold hover:bg-[#6B0A0A] transition-all shadow-md active:scale-95">
              저주의 서신 전달하기
            </button>
          </div>
        </div>
        <div className="text-[11px] text-[#5C1608] opacity-70 text-center font-medium">
          ※ 저주가 성공하면 그대의 학점 기운이 소폭 상승하리니.
        </div>
      </div>
    </div>
  );
};
