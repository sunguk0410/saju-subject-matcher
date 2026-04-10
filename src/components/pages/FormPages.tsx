import { useState } from 'react';
import { UserData } from '../../types';
import { calculateSaju } from '../../constants';

export const MyForm = ({ draftMyData, setDraftMyData, setMyData, setAiFortune, onNext }: any) => {
  const { name, date, hour, subjects } = draftMyData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateDraft = (key: string, val: any) => setDraftMyData({ ...draftMyData, [key]: val });
  const addSubject = () => updateDraft('subjects', [...subjects, '']);
  const updateSubject = (idx: number, val: string) => {
    const s = [...subjects]; s[idx] = val; updateDraft('subjects', s);
  };
  const removeSubject = (idx: number) => updateDraft('subjects', subjects.filter((_: any, i: number) => i !== idx));

  const handleSubmit = () => {
    if (!name || !date) { alert('이름과 생년월일을 입력해주세요!'); return; }
    setIsSubmitting(true);
    const userData: UserData = {
      name, date, hour,
      subjects: subjects.filter((s: string) => s.trim()),
      saju: calculateSaju(date, hour),
    };
    setMyData(userData);
    setAiFortune('');
    setIsSubmitting(false);
    onNext();
  };

  return (
    <div className="pt-4 px-4 pb-4 flex flex-col gap-3">
      <div className="font-serif text-[16px] font-bold text-[#3D1F0A] text-center mb-1 pb-2 border-b-2 border-[#C8A14B]/50 relative after:content-['✦'] after:absolute after:-bottom-2.5 after:left-1/2 after:-translate-x-1/2 after:text-[12px] after:text-[#C8A14B] after:bg-[#F5EDD0] after:px-1">
        내 정보 입력 (我의 八字)
      </div>

      <div>
        <label className="text-[10px] text-[#8B6914] font-bold uppercase tracking-widest mb-1 block">이름 (名)</label>
        <input type="text" value={name} onChange={e => updateDraft('name', e.target.value)} placeholder="이름을 입력하세요"
          className="w-full p-2 border-2 border-[#C8A14B]/40 rounded-lg bg-white/60 text-[13px] focus:outline-none focus:border-[#8B1A1A] transition-colors" />
      </div>

      <div>
        <label className="text-[10px] text-[#8B6914] font-bold uppercase tracking-widest mb-1 block">생년월일 (生年月日)</label>
        <input type="date" value={date} onChange={e => updateDraft('date', e.target.value)}
          className="w-full p-2 border-2 border-[#C8A14B]/40 rounded-lg bg-white/60 text-[13px] focus:outline-none focus:border-[#8B1A1A] transition-colors" />
      </div>

      <div>
        <label className="text-[10px] text-[#8B6914] font-bold uppercase tracking-widest mb-1 block">
          태어난 시간 (時) <span className="text-[#A09060] normal-case tracking-normal">(선택)</span>
        </label>
        <select value={hour} onChange={e => updateDraft('hour', e.target.value)}
          className="w-full p-2 border-2 border-[#C8A14B]/40 rounded-lg bg-white/60 text-[13px] focus:outline-none focus:border-[#8B1A1A] transition-colors">
          <option value="">모름</option>
          {Array.from({ length: 24 }, (_, i) => <option key={i} value={String(i)}>{i}시</option>)}
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] text-[#8B6914] font-bold uppercase tracking-widest">시험 과목 (科目)</label>
          <button onClick={addSubject} className="text-[10px] text-[#8B1A1A] font-bold hover:underline">+ 추가</button>
        </div>
        <div className="space-y-1.5">
          {subjects.map((s: string, i: number) => (
            <div key={i} className="flex gap-1.5">
              <input type="text" value={s} onChange={e => updateSubject(i, e.target.value)} placeholder={`과목 ${i + 1}`}
                className="flex-1 p-2 border-2 border-[#C8A14B]/40 rounded-lg bg-white/60 text-[12px] focus:outline-none focus:border-[#8B1A1A] transition-colors" />
              {subjects.length > 1 && (
                <button onClick={() => removeSubject(i)} className="px-2 text-[#8B1A1A] hover:bg-[#8B1A1A]/10 rounded-lg transition-colors text-[12px]">✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSubmit} disabled={isSubmitting}
        className="w-full p-3 bg-[#8B1A1A] text-[#FFD700] rounded-xl font-bold text-[14px] tracking-widest hover:bg-[#6B0A0A] disabled:opacity-50 transition-all shadow-md active:scale-95 mt-1">
        {isSubmitting ? '분석 중...' : '✦ 사주 분석 시작 ✦'}
      </button>
    </div>
  );
};
