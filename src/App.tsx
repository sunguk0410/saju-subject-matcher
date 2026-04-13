import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserData } from './types';
import Book from './components/Book';
import Landing from './components/Landing';
import { fetchAiFortune } from './lib/utils';

const getFortuneKey = (data: UserData) =>
  `${data.name}|${data.date}|${data.hour}|${data.subjects.join(',')}`;

export default function App() {
  const [myData, setMyData] = useState<UserData | null>(() => {
    const saved = localStorage.getItem('myData');
    return saved ? JSON.parse(saved) : null;
  });
  const [draftMyData, setDraftMyData] = useState<any>(() => {
    const saved = localStorage.getItem('draftMyData');
    return saved ? JSON.parse(saved) : { name: '', date: '', hour: '', subjects: [''] };
  });
  // 저장된 운세가 현재 myData와 동일한 경우에만 복원
  const [aiFortune, setAiFortune] = useState<string>(() => {
    const savedKey = localStorage.getItem('aiFortune_key');
    const savedMyData = localStorage.getItem('myData');
    if (savedKey && savedMyData) {
      const data = JSON.parse(savedMyData) as UserData;
      if (getFortuneKey(data) === savedKey) {
        return localStorage.getItem('aiFortune') || '';
      }
    }
    return '';
  });
  const [loadingAi, setLoadingAi] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isCursed, setIsCursed] = useState(() => window.location.search.includes('curse=true'));
  const fetchGenRef = useRef(0);
  const isInitialRender = useRef(true);

  // 폼 제출로 myData가 바뀔 때마다 fetch — 동일 데이터면 캐시 재사용
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (!myData) return;

    const key = getFortuneKey(myData);
    const cachedKey    = localStorage.getItem('aiFortune_key');
    const cachedFortune = localStorage.getItem('aiFortune');

    // 동일한 데이터: 기존 운세 재사용, API 재호출 없음
    if (cachedKey === key && cachedFortune) {
      setAiFortune(cachedFortune);
      return;
    }

    // 새 데이터 → 초기화 후 재요청
    setAiFortune('');
    localStorage.removeItem('aiFortune');
    localStorage.removeItem('aiFortune_key');
    const gen = ++fetchGenRef.current;
    setLoadingAi(true);
    fetchAiFortune(myData).then(fortune => {
      if (gen !== fetchGenRef.current) return;
      setAiFortune(fortune);
      setLoadingAi(false);
    });
  }, [myData]);

  useEffect(() => {
    if (myData) localStorage.setItem('myData', JSON.stringify(myData));
    else localStorage.removeItem('myData');
    localStorage.setItem('draftMyData', JSON.stringify(draftMyData));
  }, [myData, draftMyData]);

  useEffect(() => {
    if (aiFortune && !aiFortune.includes('잠들었습니다') && myData) {
      localStorage.setItem('aiFortune', aiFortune);
      localStorage.setItem('aiFortune_key', getFortuneKey(myData));
    } else if (!aiFortune) {
      localStorage.removeItem('aiFortune');
      localStorage.removeItem('aiFortune_key');
    }
  }, [aiFortune, myData]);

  return (
    <div className="min-h-screen bg-[#1A0F05] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10"
           style={{
             background: `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,200,80,0.1) 3px, rgba(255,200,80,0.1) 4px),
                          repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,0,0,0.3) 8px, rgba(0,0,0,0.3) 9px)`
           }}
      />

      <AnimatePresence>
        {isCursed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 text-center"
          >
            <div className="bg-[#FAF3DC] border-4 border-[#8B1A1A] p-6 rounded-lg shadow-[0_0_30px_rgba(139,26,26,0.5)] max-w-sm">
              <div className="text-4xl mb-4">😈</div>
              <div className="font-serif text-xl text-[#8B1A1A] font-bold mb-2">딴짓 저주에 걸렸습니다!</div>
              <div className="text-sm text-[#3D1F0A] mb-6 leading-relaxed">
                누군가 당신의 공부를 방해하기 위해<br/>
                <strong className="text-[#8B1A1A]">사주 저주</strong>를 보냈습니다.<br/><br/>
                지금 이 사주를 끝까지 보지 않으면<br/>
                기말고사 성적이 슝슝이처럼 될 것입니다.
              </div>
              <button
                onClick={() => { setIsCursed(false); setIsBookOpen(true); }}
                className="w-full p-3 bg-[#8B1A1A] text-[#FFD700] rounded font-bold tracking-widest"
              >
                저주 풀러 가기 (사주 보기)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isBookOpen ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Landing onOpen={() => setIsBookOpen(true)} />
          </motion.div>
        ) : (
          <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
            <Book
              myData={myData}
              setMyData={setMyData}
              draftMyData={draftMyData}
              setDraftMyData={setDraftMyData}
              aiFortune={aiFortune}
              setAiFortune={setAiFortune}
              loadingAi={loadingAi}
              onClose={() => setIsBookOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
