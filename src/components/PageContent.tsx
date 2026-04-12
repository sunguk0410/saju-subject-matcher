import { UserData } from '../types';
import { handleSaveImage, handleSaveSubjCompat } from '../lib/utils';
import { MyForm } from './pages/FormPages';
import { MyResult1, SubjCompatPage } from './pages/ResultPages';
import { SharePage } from './pages/InteractivePages';
import { CoverPage, FinPage } from './pages/CommonPages';

interface PageContentProps {
  type: string;
  myData: UserData | null;
  setMyData: (data: UserData | null) => void;
  draftMyData: any;
  setDraftMyData: (data: any) => void;
  aiFortune: string;
  setAiFortune: (fortune: string) => void;
  loadingAi: boolean;
  pageNumber: number;
  onNext: () => void;
}

export default function PageContent({ type, myData, setMyData, draftMyData, setDraftMyData, aiFortune, setAiFortune, loadingAi, pageNumber, onNext }: PageContentProps) {
  const renderContent = () => {
    switch (type) {
      case 'cover': return <CoverPage />;
      case 'myForm': return <MyForm draftMyData={draftMyData} setDraftMyData={setDraftMyData} setMyData={setMyData} onNext={onNext} />;
      case 'myR1': return <MyResult1 myData={myData} aiFortune={aiFortune} loadingAi={loadingAi} onSave={() => myData && handleSaveImage(myData, aiFortune, '나의사주_결과')} />;
      case 'subjCompat': return <SubjCompatPage myData={myData} onSave={() => myData && handleSaveSubjCompat(myData, '과목궁합_결과')} />;
      case 'share': return <SharePage myData={myData} />;
      case 'fin': return <FinPage />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col relative z-[2]">
      {renderContent()}
      <div className={`absolute bottom-2 text-[9px] text-[#A09060] font-serif ${pageNumber % 2 === 0 ? 'left-4' : 'right-4'}`}>
        {type === 'cover' ? '표지' : type === 'fin' ? '終' : pageNumber}
      </div>
    </div>
  );
}
