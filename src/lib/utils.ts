import { toPng } from 'html-to-image';
import { UserData } from '../types';
import { getFiveElements, getSajuValue, pick, OHF, OHK, BYEONGMAT_COMMENTS } from '../constants';
import noiseDataUrl from '../assets/noise.png?inline';

// ── 에셋 사전 로딩 ──────────────────────────────────────────────
const b64Cache = new Map<string, string>();

const fetchBase64 = async (url: string): Promise<string> => {
  if (b64Cache.has(url)) return b64Cache.get(url)!;
  try {
    const blob = await fetch(url).then(r => r.blob());
    return await new Promise(resolve => {
      const r = new FileReader();
      r.onloadend = () => { const v = r.result as string; b64Cache.set(url, v); resolve(v); };
      r.readAsDataURL(blob);
    });
  } catch { return ''; }
};

// Pretendard: 모듈 로드 시 pre-fetch, localStorage 영구 캐시 (~1.2MB)
const buildPretendardCSS = async (): Promise<string> => {
  const LS_KEY = 'capture_pret_v1';
  try { const c = localStorage.getItem(LS_KEY); if (c) return c; } catch {}
  const BASE = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/woff2-subset/';
  const faces = await Promise.all(
    ([[400, 'Regular'], [500, 'Medium'], [700, 'Bold']] as [number, string][]).map(async ([w, n]) => {
      const b64 = await fetchBase64(`${BASE}Pretendard-${n}.subset.woff2`);
      return b64 ? `@font-face{font-family:"Pretendard";font-weight:${w};font-style:normal;src:url('${b64}') format('woff2');}` : '';
    })
  );
  const result = faces.filter(Boolean).join('\n');
  try { localStorage.setItem(LS_KEY, result); } catch {}
  return result;
};

// Noto Serif KR: 캡처 시점에 text= 파라미터로 실제 사용 글자만 fetch
// text= 사용 시 ~100-200KB (전체 unicode-range embed 대비 10-20배 감소) → toPng 속도 대폭 향상
const notoCSSCache = new Map<string, string>();
const buildNotoCSS = async (pageText: string): Promise<string> => {
  const chars = [...new Set([...pageText].filter(c => c.trim()))].sort().join('');
  if (!chars) return '';
  if (notoCSSCache.has(chars)) return notoCSSCache.get(chars)!;
  try {
    let css = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&text=${encodeURIComponent(chars)}`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' } }
    ).then(r => r.text());
    const urls = [...new Set([...css.matchAll(/url\(['"]?([^'")\s]+\.woff2[^'")\s]*)['"]?\)/g)].map(m => m[1]))];
    await Promise.all(urls.map(async url => { const b64 = await fetchBase64(url); if (b64) css = css.replaceAll(url, b64); }));
    notoCSSCache.set(chars, css);
    return css;
  } catch { return ''; }
};

// 모듈 import 시 즉시 Pretendard pre-fetch 시작
const pretendardCSSPromise = buildPretendardCSS();

// ── captureScreen ────────────────────────────────────────────────
export const captureScreen = async (elementId: string, fileName: string) => {
  const el = document.getElementById(elementId);
  if (!el) return;

  // CSS zoom 조상 일시 제거 → 자연 CSS 픽셀 측정 (JS 태스크 내 복원으로 화면 깜빡임 없음)
  const zoomedAncestors: Array<{ node: HTMLElement; was: string }> = [];
  let anc: HTMLElement | null = el.parentElement;
  while (anc && anc !== document.body) {
    const z = anc.style.zoom;
    if (z && z !== '1') { zoomedAncestors.push({ node: anc, was: z }); anc.style.zoom = '1'; }
    anc = anc.parentElement;
  }
  const w = el.offsetWidth;
  zoomedAncestors.forEach(({ node, was }) => { node.style.zoom = was; });
  if (!w) return;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;top:-99999px;left:-99999px;overflow:visible;pointer-events:none;';

  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.cssText = `position:relative;top:0;left:0;width:${w}px;overflow:visible;`;

  // .page-bg CSS의 url('/noise.png') 상대경로는 html-to-image SVG 내에서 해석 불가 → base64로 직접 교체
  const applyNoiseBg = (node: HTMLElement) => {
    node.style.backgroundImage = `url('${noiseDataUrl}')`;
    node.style.backgroundRepeat = 'repeat';
  };
  if (clone.classList.contains('page-bg')) applyNoiseBg(clone);
  clone.querySelectorAll<HTMLElement>('.page-bg').forEach(applyNoiseBg);

  clone.querySelectorAll<HTMLElement>('button').forEach(b => b.remove());
  clone.querySelectorAll<HTMLElement>('.overflow-y-auto').forEach(s => {
    s.style.overflow = 'visible';
    s.style.height = 'auto';
    s.style.maxHeight = 'none';
    s.style.flexShrink = '0';
  });
  clone.querySelectorAll<HTMLElement>('.flex-1').forEach(s => { s.style.flex = 'none'; });

  // clone 텍스트 확보 후 Noto fetch를 DOM 대기 중에 병렬로 시작
  const cloneText = clone.textContent ?? '';
  const notoCSSPromise = buildNotoCSS(cloneText);

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  // RAF 대기 동안 Noto fetch가 병렬 진행됨
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // overflow:hidden 요소가 있으면 html-to-image 내부 인라인화 시 잘림 → 전부 visible로
  // 동시에 box-shadow + border-radius 조합은 모바일에서 직사각형 그림자로 렌더링되는 버그가 있으므로
  // filter: drop-shadow()로 교체 (border-radius를 따라 정확히 렌더링됨)
  clone.querySelectorAll<HTMLElement>('*').forEach(child => {
    const cs = window.getComputedStyle(child);
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden') child.style.overflow = 'visible';
    if (cs.boxShadow !== 'none' && cs.borderRadius !== '0px') {
      child.style.boxShadow = 'none';
      child.style.filter = [child.style.filter, 'drop-shadow(0 2px 6px rgba(0,0,0,0.10))'].filter(Boolean).join(' ');
    }
  });

  const h = clone.scrollHeight;
  if (!h) { wrapper.remove(); return; }

  // 9:16 프레임: 컨텐츠보다 짧으면 아래를 noise.png로 채움
  const frameH = Math.max(h, Math.round(w * 16 / 9));
  const frame = document.createElement('div');

  frame.style.cssText = `width:${w}px;height:${frameH}px;position:relative;overflow:hidden;`;
  frame.style.backgroundImage = `url('${noiseDataUrl}')`;
  frame.style.backgroundRepeat = 'repeat';
  clone.style.backgroundColor = 'transparent';
  frame.appendChild(clone);         // clone을 frame으로 이동 (DOM 자동 reparent)
  wrapper.appendChild(frame);

  // Pretendard(pre-fetched) + Noto(text= subset) 조합 → <style>로 주입
  const [pretendardCSS, notoCSS] = await Promise.all([pretendardCSSPromise, notoCSSPromise]);
  const fontCSS = [pretendardCSS, notoCSS].filter(Boolean).join('\n');
  if (fontCSS) {
    const style = document.createElement('style');
    style.textContent = fontCSS;
    clone.prepend(style);
  }

  try {
    const opts = { pixelRatio: 2, width: w, height: frameH, backgroundColor: '#FAF3DC', cacheBust: false, skipFonts: true };
    // 첫 번째 호출로 리소스를 브라우저 캐시에 올린 뒤 두 번째에서 정확히 렌더링 (모바일 shadow/font 누락 방지)
    await toPng(frame, opts);
    const dataUrl = await toPng(frame, opts);

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => a.remove(), 200);
  } catch (e) {
    console.error('captureScreen error:', e);
  } finally {
    wrapper.remove();
  }
};

export const fetchAiFortune = async (userData: UserData): Promise<string> => {
  try {
    const elements = getFiveElements(userData.saju);
    const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
    const ohaeng = (['목', '화', '토', '금', '수'] as const)
      .map(k => `${OHK[k]} ${elements[k]}개(${Math.round((elements[k] / total) * 100)}%)`)
      .join(' / ');

    const response = await fetch('/api/ai-fortune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userData.name, saju: userData.saju, ohaeng })
    });

    const data = await response.json();
    if (response.ok && data.fortune) return data.fortune;
    console.error('API 실패:', data.error);
  } catch (e) { console.error('fetch 자체 실패:', e); }
  return "잠시만 기다려주세요, 운명은 서두르지 않습니다.";
};

export const fetchSubjComment = async (subject: string, keywords: string, score?: number): Promise<string> => {
  try {
    const response = await fetch('/api/subj-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, keywords, score }),
    });
    const data = await response.json();
    if (response.ok && data.comment) return data.comment;
  } catch (e) { console.error('subj-comment fetch 실패:', e); }
  return '';
};
