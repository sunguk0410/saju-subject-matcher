import { useState } from 'react';
import { UserData } from '../../types';
import { calculateSaju } from '../../constants';

const HOUR_OPTIONS = [
  { label: '자시 (子時) 23:30~1:30', value: '23' },
  { label: '축시 (丑時) 1:30~3:30',  value: '1'  },
  { label: '인시 (寅時) 3:30~5:30',  value: '3'  },
  { label: '묘시 (卯時) 5:30~7:30',  value: '5'  },
  { label: '진시 (辰時) 7:30~9:30',  value: '7'  },
  { label: '사시 (巳時) 9:30~11:30', value: '9'  },
  { label: '오시 (午時) 11:30~13:30',value: '11' },
  { label: '미시 (未時) 13:30~15:30',value: '13' },
  { label: '신시 (申時) 15:30~17:30',value: '15' },
  { label: '유시 (酉時) 17:30~19:30',value: '17' },
  { label: '술시 (戌時) 19:30~21:30',value: '19' },
  { label: '해시 (亥時) 21:30~23:30',value: '21' },
];

const labelCls = 'text-[10px] text-[#8B6914] font-bold uppercase tracking-widest mb-1 block';

const inputBase = 'w-full p-2 border rounded-lg bg-white/60 text-[13px] focus:outline-none transition-colors shadow-sm';
const inputNormal = `${inputBase} border-[#C8A14B]/30 focus:border-[#8B1A1A] focus:shadow-md`;
const inputError  = `${inputBase} border-red-400 focus:border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.15)]`;

export const MyForm = ({ draftMyData, setDraftMyData, setMyData, onNext }: any) => {
  const { name, date, hour, subjects } = draftMyData;
  const [touched, setTouched] = useState(false);

  const nameMissing    = !name.trim();
  const dateMissing    = !date;
  const subjectMissing = !subjects.some((s: string) => s.trim());
  const hasError = nameMissing || dateMissing || subjectMissing;

  const update = (key: string, val: any) => setDraftMyData({ ...draftMyData, [key]: val });
  const updateSubject = (idx: number, val: string) => {
    const s = [...subjects]; s[idx] = val; update('subjects', s);
  };

  const handleSubmit = () => {
    if (hasError) { setTouched(true); return; }
    const userData: UserData = {
      name, date, hour,
      subjects: subjects.filter((s: string) => s.trim()),
      saju: calculateSaju(date, hour),
    };
    setMyData(userData);
    onNext();
  };

  return (
    <div className="w-full h-full page-bg">
      <div className="pt-4 px-4 pb-4 flex flex-col gap-3">
        <div className="font-serif text-[16px] font-bold text-[#3D1F0A] text-center mb-2">
          내 정보 입력 (我의 八字)
        </div>
        <div className="flex items-center gap-2 -mt-1 mb-1">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C8A14B]/50" />
          <span className="text-[#C8A14B] text-[11px]">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C8A14B]/50" />
        </div>

        {/* 유효성 안내 메시지 */}
        {touched && hasError && (
          <div className="bg-[#8B1A1A]/8 border border-[#8B1A1A]/20 rounded-xl px-3 py-2.5 -mt-1 shadow-md">
            <p className="text-[13px] text-[#8B1A1A] italic text-center mb-1.5">
              당신의 기운과 과목이 만날 수 있도록 정보를 들려주세요.
            </p>
            <ul className="text-[11px] text-[#8B1A1A] font-bold space-y-0.5 text-center">
              {nameMissing    && <li>· 이름 (名) 미입력</li>}
              {dateMissing    && <li>· 생년월일 (生年月日) 미입력</li>}
              {subjectMissing && <li>· 시험 과목 (科目) 최소 1개 이상 필요</li>}
            </ul>
          </div>
        )}

        <div>
          <label className={labelCls}>이름 (名)</label>
          <input
            type="text"
            value={name}
            onChange={e => update('name', e.target.value)}
            placeholder="이름을 입력하세요"
            className={touched && nameMissing ? inputError : inputNormal}
          />
        </div>

        <div>
          <label className={labelCls}>생년월일 (生年月日)</label>
          <input
            type="date"
            value={date}
            onChange={e => update('date', e.target.value)}
            className={touched && dateMissing ? inputError : inputNormal}
          />
        </div>

        <div>
          <label className={labelCls}>
            태어난 시간 (時) <span className="text-[#A09060] normal-case tracking-normal">(선택)</span>
          </label>
          <select value={hour} onChange={e => update('hour', e.target.value)} className={inputNormal}>
            <option value="">모름</option>
            {HOUR_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className={labelCls}>시험 과목 (科目)</label>
            <button onClick={() => update('subjects', [...subjects, ''])}
              className="text-[10px] text-[#8B1A1A] font-bold hover:underline">+ 추가</button>
          </div>
          <div className="space-y-1.5">
            {subjects.map((s: string, i: number) => (
              <div key={i} className="flex gap-1.5">
                <input type="text" value={s} onChange={e => updateSubject(i, e.target.value)}
                  placeholder={`과목 ${i + 1}`}
                  className={`flex-1 p-2 border rounded-lg bg-white/60 text-[12px] focus:outline-none transition-colors shadow-sm ${touched && subjectMissing && !s.trim() ? 'border-red-400 shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-[#C8A14B]/30 focus:border-[#8B1A1A] focus:shadow-md'}`} />
                {subjects.length > 1 && (
                  <button onClick={() => update('subjects', subjects.filter((_: any, j: number) => j !== i))}
                    className="px-2 text-[#8B1A1A] hover:bg-[#8B1A1A]/10 rounded-lg transition-colors text-[12px]">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-[#8B1A1A] text-[#FFD700] rounded-xl font-bold text-[14px] tracking-widest hover:bg-[#6B0A0A] transition-all shadow-md active:scale-95 mt-1">
          ✦ 사주 분석 시작 ✦
        </button>
      </div>
    </div>
  );
};
