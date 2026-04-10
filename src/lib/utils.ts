import html2canvas from 'html2canvas';
import { UserData } from '../types';

export const fetchAiFortune = async (userData: UserData): Promise<string> => {
  try {
    const response = await fetch('/api/ai-fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        zodiac: userData.saju.zodiac,
        subjects: userData.subjects
      })
    });
    const data = await response.json();
    if (response.ok && data.fortune) return data.fortune;
  } catch {}
  return "모든 AI가 지쳐서 잠들었습니다. 잠시 후 다시 시도해주세요.";
};

export const handleSaveImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const originalCanvas = await html2canvas(element, {
      backgroundColor: '#FAF3DC',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const targetRatio = 16 / 9;
    const currentRatio = originalCanvas.width / originalCanvas.height;

    let finalWidth, finalHeight;
    if (currentRatio > targetRatio) {
      finalWidth = originalCanvas.width;
      finalHeight = finalWidth / targetRatio;
    } else {
      finalHeight = originalCanvas.height;
      finalWidth = finalHeight * targetRatio;
    }

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FAF3DC';
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    const xOffset = (finalWidth - originalCanvas.width) / 2;
    const yOffset = (finalHeight - originalCanvas.height) / 2;
    ctx.drawImage(originalCanvas, xOffset, yOffset);

    ctx.fillStyle = '#8B6914';
    ctx.font = `bold ${Math.floor(finalHeight * 0.025)}px serif`;
    ctx.textAlign = 'right';
    ctx.fillText('✦ 슝슝이 사주풀이 ✦', finalWidth - (finalWidth * 0.05), finalHeight - (finalHeight * 0.05));

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('이미지 저장 실패:', err);
  }
};
