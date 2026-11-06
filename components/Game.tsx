'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { endings, scenario, type EndingId, type OutcomeMood, type SceneVisualKey } from '@/data/scenario';
import {
  createInitialSnapshot, resolveStepForScene, playChoice, continueConversation, useFocus,
  getHints, getStatLabel, getChoiceText, getObservation, getDebrief, toneLabels,
  type GameSnapshot,
} from '@/lib/game';

const moodClass: Record<OutcomeMood, string> = {
  good: 'border-emerald-400 bg-emerald-50 text-emerald-950',
  mixed: 'border-amber-300 bg-amber-50 text-stone-950',
  bad: 'border-rose-300 bg-rose-50 text-rose-950',
};

function CharacterScene({ mood, visualKey, area }: { mood: OutcomeMood | null; visualKey: SceneVisualKey; area: string }) {
  const sceneWash = mood === 'good' ? '#0f766e' : mood === 'bad' ? '#be123c' : '#4338ca';
  const womanMouth = mood === 'good' ? 'M92 121 Q105 132 120 121' : mood === 'bad' ? 'M93 128 Q106 118 119 128' : 'M94 124 Q106 127 119 124';
  const womanBrows = mood === 'bad'
    ? ['M78 91 Q88 85 99 89', 'M113 89 Q125 84 136 91']
    : mood === 'good'
      ? ['M78 88 Q89 84 99 88', 'M113 88 Q124 84 136 88']
      : ['M78 90 Q89 87 99 90', 'M113 90 Q124 87 136 90'];
  const womanOffset = mood === 'bad' ? 'translate(632 66) rotate(3 105 140)' : mood === 'good' ? 'translate(604 66) rotate(-1 105 140)' : 'translate(618 66)';
  const womanCoat = mood === 'bad' ? '#f7eef2' : mood === 'good' ? '#fff8eb' : '#f8f1e7';
  const womanAccent = mood === 'good' ? '#0f766e' : mood === 'bad' ? '#be123c' : '#7c3aed';
  const artBasePath = '/pua_memorial/assets/visual-novel';
  const moodName = mood === 'good' ? 'good' : mood === 'bad' ? 'bad' : 'neutral';
  const sceneAsset = `${artBasePath}/scene-${visualKey}-${moodName}.png`;
  const backgroundAsset = `${artBasePath}/bg-shibuya-night.png`;
  const manAsset = `${artBasePath}/man-neutral.png`;
  const womanAsset = `${artBasePath}/woman-${moodName}.png`;
  const [sceneFailed, setSceneFailed] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => {
    setSceneFailed(false);
    setAssetFailed(false);
  }, [sceneAsset, womanAsset]);

  return (
    <div className="relative h-[23rem] overflow-hidden bg-stone-950 sm:h-[31rem]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${area}で男女が会話しているシーン`}>
        <defs>
          <linearGradient id="stage-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0b1020" />
            <stop offset="0.52" stopColor="#172554" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="stage-street" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#273449" />
            <stop offset="1" stopColor="#080a10" />
          </linearGradient>
          <linearGradient id="stage-glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#67e8f9" stopOpacity="0.32" />
            <stop offset="0.55" stopColor="#fef3c7" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fb7185" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="male-jacket" x1="0" x2="1">
            <stop offset="0" stopColor="#111827" />
            <stop offset="1" stopColor="#374151" />
          </linearGradient>
          <filter id="stage-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="9" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="stage-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#020617" floodOpacity="0.45" />
          </filter>
        </defs>

        <rect width="1000" height="520" fill="url(#stage-sky)" />
        <rect width="1000" height="520" fill={sceneWash} opacity="0.12" />
        <path d="M0 325 C140 286 242 303 360 270 C500 232 640 264 1000 212 L1000 520 L0 520 Z" fill="#111827" opacity="0.55" />

        <g opacity="0.92">
          <path d="M12 95 L126 65 L126 390 L12 420 Z" fill="#101827" />
          <path d="M154 122 L292 78 L292 354 L154 394 Z" fill="#182235" />
          <path d="M754 66 L928 118 L928 404 L754 350 Z" fill="#111827" />
          <path d="M624 118 L736 92 L736 356 L624 388 Z" fill="#1f2937" />
          <path d="M418 134 L530 106 L530 319 L418 348 Z" fill="#172033" opacity="0.8" />
        </g>

        <g filter="url(#stage-soft-glow)" opacity="0.95">
          <rect x="46" y="126" width="52" height="16" rx="3" fill="#22d3ee" />
          <rect x="178" y="156" width="82" height="22" rx="4" fill="#f59e0b" />
          <rect x="645" y="144" width="64" height="18" rx="4" fill="#a78bfa" />
          <rect x="786" y="146" width="94" height="24" rx="4" fill="#fb7185" />
          <rect x="832" y="210" width="52" height="18" rx="3" fill="#2dd4bf" />
        </g>

        <g opacity="0.52">
          {Array.from({ length: 10 }).map((_, index) => (
            <rect key={`left-window-${index}`} x={38 + (index % 2) * 44} y={176 + Math.floor(index / 2) * 38} width="24" height="18" rx="2" fill={index % 3 === 0 ? '#fde68a' : '#38bdf8'} opacity={index % 4 === 0 ? 0.35 : 0.72} />
          ))}
          {Array.from({ length: 12 }).map((_, index) => (
            <rect key={`right-window-${index}`} x={782 + (index % 3) * 42} y={198 + Math.floor(index / 3) * 34} width="22" height="16" rx="2" fill={index % 2 === 0 ? '#f9a8d4' : '#93c5fd'} opacity={index % 5 === 0 ? 0.28 : 0.66} />
          ))}
        </g>

        <path d="M0 342 L1000 294 L1000 520 L0 520 Z" fill="url(#stage-street)" />
        <path d="M324 520 L470 315 L548 315 L706 520 Z" fill="#020617" opacity="0.34" />
        <path d="M-40 504 C214 456 444 438 1050 414" stroke="#f8fafc" strokeOpacity="0.12" strokeWidth="22" />
        <path d="M90 490 C320 442 620 418 1010 382" stroke="#14b8a6" strokeOpacity="0.22" strokeWidth="5" />
        <path d="M0 434 C214 398 556 362 1000 337" stroke="#f59e0b" strokeOpacity="0.22" strokeWidth="4" />
        <path d="M0 361 C250 332 540 312 1000 292" stroke="#f8fafc" strokeOpacity="0.12" strokeWidth="2" />

        <g opacity="0.46">
          <path d="M122 438 L212 431 L206 448 L108 456 Z" fill="#f8fafc" />
          <path d="M242 428 L340 421 L342 438 L232 447 Z" fill="#f8fafc" />
          <path d="M376 417 L486 411 L494 427 L368 436 Z" fill="#f8fafc" />
          <path d="M528 407 L650 401 L664 416 L518 426 Z" fill="#f8fafc" />
        </g>

        <g opacity="0.72" filter="url(#stage-soft-glow)">
          <path d="M0 330 C220 352 396 349 510 320 C640 287 804 275 1000 306 L1000 376 C786 338 625 352 510 382 C370 420 180 407 0 385 Z" fill="url(#stage-glass)" />
        </g>

        <g transform="translate(116 72)" filter="url(#stage-shadow)" aria-hidden="true">
          <ellipse cx="146" cy="388" rx="132" ry="20" fill="#020617" opacity="0.38" />
          <path d="M72 378 C74 298 101 248 144 244 C194 240 226 292 226 378 Z" fill="url(#male-jacket)" />
          <path d="M94 378 L112 252 L144 292 L178 252 L204 378 Z" fill="#1f2937" />
          <path d="M116 378 L127 272 L144 292 L161 272 L174 378 Z" fill="#f8fafc" />
          <path d="M130 258 L144 292 L160 258 Z" fill="#c2410c" />
          <path d="M92 290 C72 312 60 340 52 378 L82 378 C90 340 100 314 116 296 Z" fill="#111827" />
          <path d="M210 294 C236 319 248 346 254 378 L224 378 C218 340 205 314 184 296 Z" fill="#111827" />
          <path d="M101 74 C106 34 134 16 174 25 C210 33 232 66 222 116 C214 161 187 190 151 188 C114 186 96 132 101 74 Z" fill="#e9b18f" />
          <path d="M96 89 C92 45 120 18 163 13 C206 8 238 41 238 82 C205 82 181 70 160 47 C144 70 124 84 96 89 Z" fill="#171312" />
          <path d="M95 100 C78 94 78 123 94 139 C102 147 109 140 109 127" fill="#d99a7d" />
          <path d="M221 100 C238 94 238 123 222 139 C214 147 207 140 207 127" fill="#d99a7d" />
          <path d="M118 95 Q131 88 144 94" stroke="#171312" strokeWidth="6" strokeLinecap="round" />
          <path d="M170 94 Q184 88 197 95" stroke="#171312" strokeWidth="6" strokeLinecap="round" />
          <circle cx="132" cy="116" r="5" fill="#111827" />
          <circle cx="183" cy="116" r="5" fill="#111827" />
          <path d="M147 136 Q156 140 166 136" stroke="#b86b56" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M137 158 Q156 168 178 158" stroke="#7f2d22" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M83 278 L54 336 C48 348 55 362 70 362 C84 362 91 350 96 339 L118 288 Z" fill="#e9b18f" />
          <path d="M232 328 L257 362 L279 347 L250 312 Z" fill="#e9b18f" />
          <rect x="257" y="323" width="34" height="58" rx="7" fill="#020617" />
          <rect x="263" y="329" width="22" height="42" rx="4" fill="#0ea5e9" opacity="0.72" />
          <path d="M93 252 L201 252" stroke="#6b7280" strokeWidth="8" strokeLinecap="round" opacity="0.45" />
        </g>

        <g transform={womanOffset} filter="url(#stage-shadow)" aria-hidden="true">
          <ellipse cx="130" cy="390" rx="138" ry="20" fill="#020617" opacity="0.36" />
          <path d="M47 382 C54 292 82 240 130 238 C180 236 214 292 220 382 Z" fill={womanCoat} />
          <path d="M72 382 C80 302 98 256 130 256 C164 256 184 302 193 382 Z" fill="#343036" />
          <path d="M101 252 L130 286 L160 252 L148 382 L112 382 Z" fill="#fff7ed" />
          <path d="M116 258 L130 286 L145 258 Z" fill={womanAccent} />
          <path d="M75 286 C49 308 36 338 31 382 L62 382 C68 346 81 321 102 300 Z" fill={womanCoat} />
          <path d="M187 288 C215 313 230 344 236 382 L205 382 C198 347 184 321 164 301 Z" fill={womanCoat} />
          <path d="M74 74 C76 30 108 4 153 14 C197 25 220 64 209 119 C199 167 171 198 130 196 C89 194 70 132 74 74 Z" fill="#f2bf9f" />
          <path d="M71 94 C58 39 94 -3 150 1 C207 5 229 58 218 109 C184 105 156 87 137 55 C124 78 102 93 71 94 Z" fill="#2a2321" />
          <path d="M77 105 C58 98 58 130 77 145 C86 152 93 143 92 131" fill="#e9ad8e" />
          <path d="M207 105 C226 98 226 130 207 145 C198 152 191 143 192 131" fill="#e9ad8e" />
          <path d={womanBrows[0]} stroke="#2a2321" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d={womanBrows[1]} stroke="#2a2321" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="89" cy="106" r="5" fill="#111827" />
          <circle cx="125" cy="106" r="5" fill="#111827" />
          <path d="M101 126 Q106 130 113 126" stroke="#b86b56" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d={womanMouth} fill="none" stroke="#7a2f28" strokeWidth="5" strokeLinecap="round" />
          <path d="M62 246 C42 282 37 324 48 366" stroke="#d9c8bc" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
          <path d="M184 249 C205 284 213 326 202 366" stroke="#d9c8bc" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
          <path d="M52 336 L75 365 L96 352 L72 321 Z" fill="#f2bf9f" />
          <path d="M222 332 L244 361 L265 347 L239 317 Z" fill="#f2bf9f" />
          <rect x="245" y="323" width="34" height="56" rx="7" fill="#111827" />
          <rect x="251" y="329" width="22" height="40" rx="4" fill={womanAccent} opacity="0.68" />
          <path d="M57 382 L206 382" stroke="#d6c8bd" strokeWidth="8" strokeLinecap="round" />
        </g>

        <rect x="0" y="0" width="1000" height="520" fill="#020617" opacity="0.12" />
        <path d="M0 0 H1000 V520 H0 Z" fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
      </svg>
      {!sceneFailed && (
        <img
          src={sceneAsset}
          alt=""
          className="absolute inset-0 z-10 h-full w-full object-cover"
          aria-hidden="true"
          onError={() => setSceneFailed(true)}
        />
      )}
      {sceneFailed && !assetFailed && (
        <div className="absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
          <img
            src={backgroundAsset}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setAssetFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-stone-950/10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stone-950/65 to-transparent" />
          <img
            src={manAsset}
            alt=""
            className="absolute bottom-0 left-[4%] h-[86%] max-w-[42%] object-contain object-bottom drop-shadow-[0_24px_28px_rgba(0,0,0,0.45)] sm:left-[8%] sm:h-[88%]"
            onError={() => setAssetFailed(true)}
          />
          <img
            src={womanAsset}
            alt=""
            className={`absolute bottom-0 h-[88%] max-w-[44%] object-contain object-bottom drop-shadow-[0_24px_28px_rgba(0,0,0,0.45)] sm:h-[90%] ${
              mood === 'good' ? 'right-[8%]' : mood === 'bad' ? 'right-[3%]' : 'right-[6%]'
            }`}
            onError={() => setAssetFailed(true)}
          />
        </div>
      )}
    </div>
  );
}

export function Game() {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => createInitialSnapshot(0));
  const [collection, setCollection] = useState<EndingId[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const interactionRef = useRef<HTMLDivElement>(null);
  const lastLog = snapshot.logs.at(-1);
  const moodLabels = { good: '会話がほぐれた', mixed: 'まだ様子を見ている', bad: '距離ができた' };
  const debrief = snapshot.ending ? getDebrief(snapshot) : [];

  const baseStep = scenario[snapshot.stepIndex];
  const step = useMemo(() => resolveStepForScene(baseStep, snapshot.target.visualKey), [baseStep, snapshot.target.visualKey]);
  const hints = useMemo(() => getHints(snapshot), [snapshot]);
  const mentalLabel = getStatLabel(snapshot.player.mental, ['低い', '保っている', '安定']);
  const observationLabel = getStatLabel(snapshot.player.observation, ['鈍い', '普通', '冴えている']);
  const progress = snapshot.ending ? 100 : ((snapshot.stepIndex + 1) / scenario.length) * 100;
  const currentPlace = snapshot.target.area;

  useEffect(() => {
    setSnapshot(createInitialSnapshot());
    try {
      const stored: unknown = JSON.parse(localStorage.getItem('pua-memorial-endings-v1') ?? '[]');
      if (Array.isArray(stored)) {
        setCollection([...new Set(stored.filter((id): id is EndingId => typeof id === 'string' && Object.prototype.hasOwnProperty.call(endings, id)))]);
      }
    } catch { /* The current run remains playable when storage is unavailable. */ }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady || !snapshot.ending) return;
    const id = snapshot.ending.id;
    setCollection((current) => current.includes(id) ? current : [...current, id]);
  }, [storageReady, snapshot.ending]);

  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem('pua-memorial-endings-v1', JSON.stringify(collection)); }
    catch { /* Collection still works in memory for this session. */ }
  }, [collection, storageReady]);

  useEffect(() => {
    if (snapshot.logs.length > 0) interactionRef.current?.focus();
  }, [snapshot.logs.length, snapshot.awaitingContinue]);

  const choose = (choiceId: string) => setSnapshot((current) => playChoice(current, choiceId));
  const restart = (sameEncounter = false) => {
    setSnapshot(createInitialSnapshot(sameEncounter ? snapshot.seed : undefined));
  };

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-5 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-md border border-stone-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold text-teal-700">pua_memorial</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">{snapshot.ending ? snapshot.ending.title : currentPlace}</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">{snapshot.ending ? snapshot.ending.tone : `${step.phaseLabel} / ${snapshot.stepIndex + 1}ターン目・最大6ターン`}</p>
              {!snapshot.ending && (
                <p className="mt-1 text-sm font-semibold leading-6 text-stone-700">相手: {snapshot.target.label}</p>
              )}
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:w-[25rem]">
              <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-600">メンタル</span>
                  <span className="font-bold text-stone-950">{mentalLabel}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-200">
                  <div className="h-2 rounded-full bg-teal-700" style={{ width: `${(snapshot.player.mental / 8) * 100}%` }} />
                </div>
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-stone-600">観察力</span>
                  <span className="font-bold text-stone-950">{observationLabel}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-200">
                  <div className="h-2 rounded-full bg-indigo-700" style={{ width: `${(snapshot.player.observation / 8) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full rounded-full bg-stone-950 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-[0_18px_48px_rgba(28,25,23,0.10)]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 py-3 sm:px-5">
              <span className="rounded-full bg-stone-950 px-3 py-1 text-sm font-semibold text-white">{snapshot.ending ? 'エンディング' : step.phaseLabel}</span>
              <span className="text-sm font-medium text-stone-500">{snapshot.ending ? '結果' : '会話中'}</span>
            </div>

            <CharacterScene mood={snapshot.lastMood} visualKey={snapshot.target.visualKey} area={snapshot.target.area} />

            <div className="px-4 py-5 sm:px-5">
              <div className="grid gap-5 border-b border-stone-200 pb-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
                <div>
                  <p className="text-xs font-bold text-stone-500">場面</p>
                  <p className="mt-2 text-base leading-8 text-stone-700">{snapshot.ending ? snapshot.ending.body : step.narration}</p>
                </div>
                <div className="border-l-4 border-teal-700 bg-teal-50 px-4 py-3">
                  <p className="text-xs font-bold text-teal-800">相手の言葉</p>
                  <p className="mt-2 text-xl font-semibold leading-9 text-stone-950">{snapshot.ending || snapshot.awaitingContinue ? snapshot.lastReply : step.npcLine}</p>
                </div>
              </div>

              <div ref={interactionRef} tabIndex={-1} className="mt-5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
              {snapshot.awaitingContinue && !snapshot.ending ? (
                <div className={`rounded-md border p-5 ${snapshot.lastMood ? moodClass[snapshot.lastMood] : ''}`}>
                  <p className="text-xs font-bold">返答の結果 / {snapshot.lastMood && moodLabels[snapshot.lastMood]}</p>
                  <p className="mt-2 text-base leading-8">{lastLog?.reply}</p>
                  {lastLog?.feedback.map((note) => <p key={note} className="mt-3 rounded-md bg-white/70 px-3 py-2 text-sm font-semibold leading-6">{note}</p>)}
                  <button type="button" onClick={() => setSnapshot(continueConversation)} className="mt-5 rounded-md bg-stone-950 px-5 py-3 font-bold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2">
                    会話を続ける →
                  </button>
                </div>
              ) : !snapshot.ending ? (
                <div>
                  <div className="mb-5 rounded-md border border-indigo-200 bg-indigo-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-bold text-indigo-950">集中力 {snapshot.focus} / 2</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled={!snapshot.focus || snapshot.observed} onClick={() => setSnapshot((current) => useFocus(current, 'observe'))} className="rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-bold text-indigo-950 hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">相手を観察する −1</button>
                        <button type="button" disabled={!snapshot.focus || snapshot.player.mental >= 8} onClick={() => setSnapshot((current) => useFocus(current, 'breathe'))} className="rounded-md border border-indigo-300 bg-white px-3 py-2 text-sm font-bold text-indigo-950 hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">深呼吸する −1</button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-indigo-900">1プレイで2回だけ。観察は仕草の手がかりと観察力＋2、深呼吸はメンタル＋3。ターンは進みません。</p>
                    {snapshot.observed && <ul className="mt-3 grid gap-2 border-t border-indigo-200 pt-3 text-sm leading-6 text-indigo-950" aria-live="polite">{getObservation(snapshot).map((note) => <li key={note}>・{note}</li>)}</ul>}
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-stone-500">選択</p>
                    <p className="text-sm font-medium text-stone-500">次の返しを選ぶ</p>
                  </div>
                  <div className="grid gap-3">
                    {step.choices.map((choice, index) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => choose(choice.id)}
                        className="group grid min-h-[6.5rem] grid-cols-[2.75rem_1fr] items-start gap-3 rounded-md border-2 border-stone-200 bg-[#fcfcfb] p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-700 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                        aria-label={`選択肢 ${index + 1}: ${getChoiceText(choice, snapshot.player.mental)}`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-base font-bold text-white transition group-hover:bg-teal-700">
                          {index + 1}
                        </span>
                        <span>
                          <span className="mb-1 block text-xs font-bold text-teal-800">{toneLabels[choice.tone]}</span>
                          <span className="block text-lg font-bold leading-8 text-stone-950">{getChoiceText(choice, snapshot.player.mental)}</span>
                          <span className="mt-2 block border-l-2 border-stone-300 pl-3 text-sm leading-6 text-stone-600">{choice.intent}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="rounded-md border border-teal-200 bg-teal-50 p-4">
                    <h2 className="font-bold text-teal-950">今回の振り返り</h2>
                    <ul className="mt-3 grid gap-2 text-sm leading-7 text-teal-950">{debrief.map((note) => <li key={note}>・{note}</li>)}</ul>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      {[['警戒', snapshot.hidden.caution], ['興味', snapshot.hidden.interest], ['ノリ', snapshot.hidden.vibe], ['時間圧', snapshot.hidden.timePressure]].map(([label, value]) => <p key={label} className="rounded bg-white px-3 py-2"><span className="block text-xs text-stone-500">{label}</span><span className="font-bold">{value} / 8</span></p>)}
                    </div>
                    <p className="mt-3 text-xs leading-6 text-teal-900">数値は終了後に公開。会話ログで、どの返しが空気を変えたか確認できます。</p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => restart(true)}
                    className="rounded-md border-2 border-teal-800 bg-white px-5 py-3 text-base font-bold text-teal-900 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                  >同じ相手に再挑戦</button>
                  <button
                    type="button"
                    onClick={() => restart()}
                    className="rounded-md bg-stone-950 px-5 py-3 text-base font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                  >
                    新しい相手で遊ぶ
                  </button>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-stone-500">再挑戦では初期状態と反応の揺れを再現。選び方を変えて試せます。</p>
                </div>
              )}
              </div>
            </div>
          </section>

          <aside className="grid content-start gap-4 xl:sticky xl:top-5">
            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">エンディング記録 <span className="text-teal-700">{collection.length} / {Object.keys(endings).length}</span></h2>
              <div className="mt-3 flex flex-wrap gap-2">{Object.values(endings).map((ending) => <span key={ending.id} className={`rounded-full border px-3 py-1 text-xs ${collection.includes(ending.id) ? 'border-teal-200 bg-teal-50 font-bold text-teal-900' : 'border-stone-200 bg-stone-50 text-stone-400'}`}>{collection.includes(ending.id) ? ending.title : '未発見'}</span>)}</div>
            </section>
            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">今回の相手</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-900">{snapshot.target.label}</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{snapshot.target.summary}</p>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">観察メモ</h2>
              <p className="mt-2 text-xs leading-6 text-stone-500">返答ごとに時間が進みます。質問→受け止める、など会話のつながりも大切。</p>
              <div className="mt-3 grid gap-3">
                {hints.map((hint) => (
                  <p key={hint} className="border-l-4 border-indigo-600 bg-indigo-50 px-3 py-2 text-sm leading-6 text-stone-700">
                    {hint}
                  </p>
                ))}
              </div>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">直前の反応</h2>
              <p className={`mt-3 rounded-md border px-3 py-3 text-sm leading-7 ${snapshot.lastMood ? moodClass[snapshot.lastMood] : 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                {snapshot.lastReply}
              </p>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">流れ</h2>
              <ol className="mt-3 max-h-[22rem] space-y-3 overflow-auto pr-1">
                {snapshot.logs.length === 0 ? (
                  <li className="text-sm leading-6 text-stone-500">まだ会話は始まっていない。</li>
                ) : (
                  snapshot.logs.map((log, index) => (
                    <li key={`${log.phase}-${index}`} className="border-l-4 border-stone-300 pl-3">
                      <p className="text-xs font-bold text-stone-500">{log.phase}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-800">{log.choiceText}</p>
                      <p className={`mt-2 rounded border px-2 py-1 text-sm leading-6 ${moodClass[log.mood]}`}>{log.reply}</p>
                      {log.feedback.map((note) => <p key={note} className="mt-1 text-xs leading-6 text-teal-800">{note}</p>)}
                      {snapshot.ending && <p className="mt-2 text-xs leading-6 text-stone-500">警戒 {log.before.caution}→{log.after.caution} / 興味 {log.before.interest}→{log.after.interest} / ノリ {log.before.vibe}→{log.after.vibe} / 時間圧 {log.before.timePressure}→{log.after.timePressure}</p>}
                    </li>
                  ))
                )}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
