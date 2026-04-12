import { UserData } from '../types';
import { getFiveElements, getSajuValue, pick, OHF, OHK, BYEONGMAT_COMMENTS } from '../constants';

export const fetchAiFortune = async (userData: UserData): Promise<string> => {
  try {
    console.log('보내는 데이터:', {
      name: userData.name,
      subjects: userData.subjects,
      saju: userData.saju,
    });

    const response = await fetch('/api/ai-fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        subjects: userData.subjects,
        saju: userData.saju,
      })
    });

    // 👇 추가: 실제 에러 메시지 확인
    const data = await response.json();
    console.log('서버 응답:', response.status, data);

    if (response.ok && data.fortune) return data.fortune;
    
    // 👇 추가: 어떤 에러인지 출력
    console.error('API 실패:', data.error);
    
  } catch (e) {
    console.error('fetch 자체 실패:', e); // 👇 catch도 로그 추가
  }
  return "잠시만 기다려주세요, 운명은 서두르지 않습니다.";
};

export const fetchSubjComment = async (subject: string, keywords: string): Promise<string> => {
  try {
    const response = await fetch('/api/subj-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, keywords }),
    });
    const data = await response.json();
    if (response.ok && data.comment) return data.comment;
  } catch (e) {
    console.error('subj-comment fetch 실패:', e);
  }
  return '';
};

// 긴 텍스트를 maxWidth에 맞게 줄바꿈해서 그리기
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split('');
  let line = '';
  let curY = y;
  for (const ch of words) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, curY);
      line = ch;
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY + lineHeight;
}

// 오각형 좌표 계산
const PENTA = [
  { key: '목', nx: 0,    ny: -1   },
  { key: '화', nx: 0.95, ny: -0.3 },
  { key: '토', nx: 0.59, ny: 0.81 },
  { key: '금', nx: -0.59, ny: 0.81},
  { key: '수', nx: -0.95, ny: -0.3},
];

export const handleSaveImage = (userData: UserData, aiFortune: string, fileName: string) => {
  const s = userData.saju;
  const elements = getFiveElements(s);
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const comment = pick(BYEONGMAT_COMMENTS, getSajuValue(s));

  // 9:16 캔버스 (1080×1920)
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const PAD = 72;
  const INNER = W - PAD * 2;
  const GAP = 56; // 섹션 간 간격

  // ── 배경 ──
  ctx.fillStyle = '#FAF3DC';
  ctx.fillRect(0, 0, W, H);

  // 배경 패턴
  ctx.fillStyle = 'rgba(200,161,75,0.04)';
  for (let i = 0; i < H; i += 6) ctx.fillRect(0, i, W, 2);

  // 테두리
  ctx.strokeStyle = '#C8A14B';
  ctx.lineWidth = 6;
  ctx.strokeRect(PAD / 2, PAD / 2, W - PAD, H - PAD);
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(PAD / 2 + 14, PAD / 2 + 14, W - PAD - 28, H - PAD - 28);
  ctx.setLineDash([]);

  let y = 100;

  // ── 제목 ──
  ctx.fillStyle = '#3D1F0A';
  ctx.font = `bold 72px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(`${userData.name}의 사주`, W / 2, y + 62);
  ctx.fillStyle = '#8B6914';
  ctx.font = `38px sans-serif`;
  ctx.fillText(`${new Date(userData.date).getFullYear()}년생 · ${s.zodiac}띠`, W / 2, y + 118);
  y += 148;

  // 구분선
  ctx.strokeStyle = '#C8A14B';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
  y += GAP;

  // ── AI 한줄 요약 (높이 220) ──
  const AI_H = 220;
  ctx.fillStyle = 'rgba(139,26,26,0.08)';
  roundRect(ctx, PAD, y, INNER, AI_H, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(139,26,26,0.3)'; ctx.lineWidth = 3;
  roundRect(ctx, PAD, y, INNER, AI_H, 24); ctx.stroke();

  ctx.fillStyle = '#8B1A1A';
  ctx.font = `bold 36px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🤖 사주 한줄 요약', PAD + 28, y + 52);
  ctx.fillStyle = '#3D1F0A';
  ctx.font = `italic 32px sans-serif`;
  wrapText(ctx, aiFortune || '분석 결과가 없습니다.', PAD + 28, y + 110, INNER - 56, 42);
  y += AI_H + GAP;

  // ── 사주 팔자 ──
  ctx.fillStyle = '#8B6914';
  ctx.font = `bold 32px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('사주 팔자 (四柱八字)', PAD, y + 28);
  y += 48;

  const PILLAR_LABELS = ['년', '월', '일', '시'];
  const pillars = [s.year, s.month, s.day, s.hour];
  const PW = (INNER - 18) / 4;
  const PH = 220;

  pillars.forEach((pillar, i) => {
    const px = PAD + i * (PW + 6);
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, px, y, PW, PH, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(200,161,75,0.5)'; ctx.lineWidth = 3;
    roundRect(ctx, px, y, PW, PH, 18); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = `bold 82px serif`;
    ctx.fillStyle = '#003087';
    ctx.fillText(pillar.sky, px + PW / 2, y + 96);
    ctx.fillStyle = '#8B2500';
    ctx.fillText(pillar.earth, px + PW / 2, y + 178);

    ctx.font = `bold 26px sans-serif`;
    ctx.fillStyle = '#A09060';
    ctx.fillText(PILLAR_LABELS[i] + '주', px + PW / 2, y + PH - 12);
  });
  y += PH + GAP;

  // ── 오행 분석 (높이 560) ──
  const OH_H = 560;
  ctx.fillStyle = '#8B6914';
  ctx.font = `bold 32px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('오행 분석 (五行分析)', PAD, y + 28);
  y += 48;

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  roundRect(ctx, PAD, y, INNER, OH_H, 24); ctx.fill();
  ctx.strokeStyle = 'rgba(200,161,75,0.3)'; ctx.lineWidth = 2;
  roundRect(ctx, PAD, y, INNER, OH_H, 24); ctx.stroke();

  // 오각형 차트
  const cx = W / 2, cy = y + 270, R = 190;

  [0.25, 0.5, 0.75, 1].forEach(r => {
    ctx.beginPath();
    ctx.strokeStyle = r === 1 ? 'rgba(200,161,75,0.4)' : 'rgba(200,161,75,0.15)';
    ctx.lineWidth = r === 1 ? 1.5 : 1;
    ctx.setLineDash(r === 1 ? [6, 6] : []);
    PENTA.forEach(({ nx, ny }, i) => {
      const px = cx + nx * R * r, py = cy + ny * R * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath(); ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.beginPath();
  PENTA.forEach(({ key, nx, ny }, i) => {
    const ratio = ((elements[key] || 0) / 8) * 0.8 + 0.2;
    const px = cx + nx * R * ratio, py = cy + ny * R * ratio;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,161,75,0.4)'; ctx.fill();
  ctx.strokeStyle = '#8B6914'; ctx.lineWidth = 3; ctx.stroke();

  PENTA.forEach(({ key, nx, ny }) => {
    const lx = cx + nx * (R + 50), ly = cy + ny * (R + 50);
    const pct = Math.round((elements[key] / total) * 100);
    ctx.font = `bold 36px serif`; ctx.fillStyle = OHF[key]; ctx.textAlign = 'center';
    ctx.fillText(OHK[key], lx, ly - 8);
    ctx.font = `30px sans-serif`;
    ctx.fillText(`${pct}%`, lx, ly + 34);
  });

  // 오행 배지
  const ohKeys = (['목', '화', '토', '금', '수'] as const).filter(k => elements[k] > 0);
  const badgeW = 120, badgeH = 58, badgeGap = 14;
  const totalBadgeW = ohKeys.length * badgeW + (ohKeys.length - 1) * badgeGap;
  let bx = W / 2 - totalBadgeW / 2;
  const by = y + OH_H - 76;
  const OHBg: Record<string, string> = {
    '목': '#E8F5E9', '화': '#FFEBEE', '토': '#FFF8E1', '금': '#ECEFF1', '수': '#E3F2FD',
  };
  ohKeys.forEach(k => {
    ctx.fillStyle = OHBg[k];
    roundRect(ctx, bx, by, badgeW, badgeH, 29); ctx.fill();
    ctx.fillStyle = OHF[k]; ctx.font = `bold 30px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(`${OHK[k]} ${elements[k]}`, bx + badgeW / 2, by + 38);
    bx += badgeW + badgeGap;
  });
  y += OH_H + GAP;

  // ── 병맛 코멘트 ──
  const CMT_H = 160;
  ctx.fillStyle = '#8B1A1A'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD, y + CMT_H); ctx.stroke();
  ctx.fillStyle = 'rgba(139,26,26,0.05)';
  ctx.fillRect(PAD + 8, y, INNER - 8, CMT_H);
  ctx.fillStyle = '#5C1608'; ctx.font = `italic 30px serif`; ctx.textAlign = 'left';
  wrapText(ctx, comment, PAD + 36, y + 48, INNER - 72, 44);
  y += CMT_H + GAP;

  // ── 하단 워터마크 ──
  ctx.fillStyle = '#C8A14B';
  ctx.font = `bold 32px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✦ 슝슝이 사주풀이 · 중간고사 특별판 ✦', W / 2, H - 64);

  // 다운로드
  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleSaveSubjCompat = (userData: UserData, fileName: string) => {
  const s = userData.saju;
  const sv = getSajuValue(s);
  const myOh = getFiveElements(s);

  const ohKeys = Object.keys(OHK);
  const getSubjOh = (name: string) => {
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ohKeys[hash % ohKeys.length];
  };

  const subjects = userData.subjects.map((subj, i) => {
    const oh = getSubjOh(subj);
    const score = Math.min(99, Math.max(30, 40 + (myOh[oh] || 0) * 12 + (sv + i * 13) % 35));
    const comment = score >= 80
      ? '이 과목은 당신의 기운과 찰떡궁합! 공부한 만큼 성적이 나올 것이로다.'
      : score >= 60
      ? '무난한 궁합이다. 노력이 배신하지는 않을 것이니 정진하라.'
      : '기운이 충돌한다! 남들보다 두 배는 더 노력해야 평타라도 칠 것이로다.';
    return { subj, oh, score, comment };
  });

  const W = 1080;
  const H = 1920;
  const PAD = 72;
  const INNER = W - PAD * 2;
  const HEADER_H = 240;
  const GAP = 28;
  const ITEM_H = 220;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 배경
  ctx.fillStyle = '#FAF3DC';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(200,161,75,0.04)';
  for (let i = 0; i < H; i += 6) ctx.fillRect(0, i, W, 2);

  // 테두리
  ctx.strokeStyle = '#C8A14B'; ctx.lineWidth = 6;
  ctx.strokeRect(PAD / 2, PAD / 2, W - PAD, H - PAD);
  ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
  ctx.strokeRect(PAD / 2 + 14, PAD / 2 + 14, W - PAD - 28, H - PAD - 28);
  ctx.setLineDash([]);

  // 제목
  ctx.fillStyle = '#3D1F0A'; ctx.font = `bold 68px serif`; ctx.textAlign = 'center';
  ctx.fillText('과목별 궁합 분석 (科目宮合)', W / 2, 110);
  ctx.fillStyle = '#8B6914'; ctx.font = `36px sans-serif`;
  ctx.fillText(`${userData.name} · ${s.zodiac}띠`, W / 2, 170);

  // 구분선
  ctx.strokeStyle = '#C8A14B'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(PAD, 210); ctx.lineTo(W - PAD, 210); ctx.stroke();

  const OHBg: Record<string, string> = {
    '목': '#E8F5E9', '화': '#FFEBEE', '토': '#FFF8E1', '금': '#ECEFF1', '수': '#E3F2FD',
  };
  const scoreColor = (score: number) => score >= 80 ? '#2E7D32' : score >= 60 ? '#C8A14B' : '#8B1A1A';

  // 폰트 크기를 카드 높이에 비례하게 계산
  const fs = (base: number) => Math.round(base * (ITEM_H / 220));

  let y = HEADER_H;
  subjects.forEach(({ subj, oh, score, comment }) => {
    // 카드 배경
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    roundRect(ctx, PAD, y, INNER, ITEM_H, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(200,161,75,0.3)'; ctx.lineWidth = 2;
    roundRect(ctx, PAD, y, INNER, ITEM_H, 20); ctx.stroke();

    const badgeH = Math.round(ITEM_H * 0.27);
    const badgeW = Math.round(badgeH * 1.55);
    const badgeY = y + Math.round(ITEM_H * 0.12);
    const nameY = y + Math.round(ITEM_H * 0.38);
    const barY = y + Math.round(ITEM_H * 0.55);
    const barH = Math.max(12, Math.round(ITEM_H * 0.07));
    const commentY = y + Math.round(ITEM_H * 0.80);

    // 오행 배지
    ctx.fillStyle = OHBg[oh] || '#F5F5F5';
    roundRect(ctx, PAD + 20, badgeY, badgeW, badgeH, badgeH / 2); ctx.fill();
    ctx.fillStyle = OHF[oh] || '#333'; ctx.font = `bold ${fs(30)}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(OHK[oh] || oh, PAD + 20 + badgeW / 2, badgeY + badgeH * 0.68);

    // 과목명
    ctx.fillStyle = '#3D1F0A'; ctx.font = `bold ${fs(46)}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText(subj, PAD + 20 + badgeW + 20, nameY);

    // 점수
    ctx.fillStyle = scoreColor(score); ctx.font = `bold ${fs(54)}px serif`; ctx.textAlign = 'right';
    ctx.fillText(`${score}점`, W - PAD - 20, nameY);

    // 진행 바
    const barW = INNER - 40;
    ctx.fillStyle = 'rgba(200,161,75,0.15)';
    roundRect(ctx, PAD + 20, barY, barW, barH, barH / 2); ctx.fill();
    ctx.fillStyle = scoreColor(score);
    roundRect(ctx, PAD + 20, barY, barW * (score / 100), barH, barH / 2); ctx.fill();

    // 코멘트
    ctx.fillStyle = '#5C3010'; ctx.font = `italic ${fs(28)}px serif`; ctx.textAlign = 'left';
    ctx.fillText(comment, PAD + 20, commentY);

    y += ITEM_H + GAP;
  });

  // 워터마크
  ctx.fillStyle = '#C8A14B'; ctx.font = `bold 30px serif`; ctx.textAlign = 'center';
  ctx.fillText('✦ 슝슝이 사주풀이 · 중간고사 특별판 ✦', W / 2, H - 46);

  const link = document.createElement('a');
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}
