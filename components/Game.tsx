'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  endings,
  scenario,
  targetProfiles,
  type Choice,
  type Ending,
  type HiddenState,
  type OutcomeMood,
  type PlayerState,
  type SceneVisualKey,
  type TargetProfile,
  type TargetRisk,
} from '@/data/scenario';

type TurnLog = {
  phase: string;
  choiceText: string;
  reply: string;
  mood: OutcomeMood;
};

type GameSnapshot = {
  stepIndex: number;
  target: TargetProfile;
  player: PlayerState;
  hidden: HiddenState;
  lastReply: string;
  lastMood: OutcomeMood | null;
  logs: TurnLog[];
  ending: Ending | null;
};

const clamp = (value: number, min = 0, max = 8) => Math.max(min, Math.min(max, value));
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const hasRisk = (target: TargetProfile, risk: TargetRisk) => target.risks?.includes(risk) ?? false;

const createInitialSnapshot = (randomized = true): GameSnapshot => {
  const target = randomized ? targetProfiles[randomInt(0, targetProfiles.length - 1)] : targetProfiles[0];
  const modifier = target.modifier;

  return {
    stepIndex: 0,
    target,
    player: {
      mental: clamp((randomized ? randomInt(4, 6) : 5) + (modifier.mental ?? 0)),
      observation: clamp((randomized ? randomInt(3, 5) : 4) + (modifier.observation ?? 0)),
    },
    hidden: {
      caution: clamp((randomized ? randomInt(2, 4) : 3) + (modifier.caution ?? 0)),
      interest: clamp((randomized ? randomInt(1, 3) : 2) + (modifier.interest ?? 0)),
      vibe: clamp((randomized ? randomInt(1, 3) : 2) + (modifier.vibe ?? 0)),
      timePressure: clamp((randomized ? randomInt(1, 3) : 2) + (modifier.timePressure ?? 0)),
    },
    lastReply: `ヒット: ${target.label}。${target.summary}`,
    lastMood: null,
    logs: [],
    ending: null,
  };
};

const mergeEffect = (base: Choice['effect'], extra?: Choice['effect']) => ({
  caution: (base.caution ?? 0) + (extra?.caution ?? 0),
  interest: (base.interest ?? 0) + (extra?.interest ?? 0),
  vibe: (base.vibe ?? 0) + (extra?.vibe ?? 0),
  timePressure: (base.timePressure ?? 0) + (extra?.timePressure ?? 0),
  mental: (base.mental ?? 0) + (extra?.mental ?? 0),
  observation: (base.observation ?? 0) + (extra?.observation ?? 0),
});

const applyChoice = (snapshot: GameSnapshot, choice: Choice) => {
  const lowMental = snapshot.player.mental <= 2;
  const effect = mergeEffect(choice.effect, lowMental ? choice.lowMentalEffect : undefined);
  const hidden = { ...snapshot.hidden };
  const player = { ...snapshot.player };
  const notes: string[] = [];

  hidden.caution += effect.caution;
  hidden.interest += effect.interest;
  hidden.vibe += effect.vibe;
  hidden.timePressure += effect.timePressure;
  player.mental += effect.mental;
  player.observation += effect.observation;

  if (!choice.mine && Math.random() < 0.42) {
    hidden.interest += randomInt(-1, 1);
  }

  if (!choice.mine && Math.random() < 0.36) {
    hidden.vibe += randomInt(-1, 1);
  }

  if (Math.random() < 0.18) {
    hidden.timePressure += 1;
    notes.push('スマホの通知で、相手が一瞬だけ時間を気にした。');
  }

  if (choice.tone === 'withdraw' && snapshot.hidden.caution >= 4) {
    hidden.caution -= 1;
    hidden.interest += 1;
    notes.push('引く余白を見せたことで、少し安心感が出た。');
  }

  if (choice.tone === 'withdraw' && snapshot.hidden.interest >= 5 && snapshot.hidden.caution <= 2) {
    hidden.interest -= 1;
    notes.push('良い空気の中で引きすぎて、少しだけ熱が落ちた。');
  }

  if (choice.tone === 'pushy' && snapshot.hidden.caution >= 3) {
    hidden.caution += 1;
    hidden.vibe -= 1;
  }

  if (choice.tone === 'listen' && snapshot.hidden.vibe >= 3) {
    hidden.interest += 1;
  }

  if (choice.tone === 'playful' && snapshot.hidden.vibe <= 1) {
    hidden.caution += 1;
    hidden.vibe -= 1;
  }

  if (choice.tone === 'pushy' && hasRisk(snapshot.target, 'powerRisk')) {
    hidden.caution += 1;
    hidden.vibe -= 1;
    notes.push('圧の強さに反応が硬くなった。');
  }

  if ((choice.id === 'konbini-hotel' || choice.id === 'hard-home') && hasRisk(snapshot.target, 'troubleRisk')) {
    hidden.caution += 1;
    notes.push('条件確認が曖昧なままだと、後で揉めそうな気配がある。');
  }

  if (choice.id === 'money-hotel' && hasRisk(snapshot.target, 'moneyRisk')) {
    hidden.caution += 1;
    hidden.timePressure += 1;
    notes.push('金額や店の話が出た瞬間、会話の温度が別方向に変わった。');
  }

  if (choice.id === 'cut-loss' && (hasRisk(snapshot.target, 'troubleRisk') || hasRisk(snapshot.target, 'moneyRisk'))) {
    player.mental += 1;
    hidden.caution -= 1;
    notes.push('違和感を優先して引いたので、事故の芽を潰せた。');
  }

  if (lowMental && choice.tone !== 'withdraw') {
    hidden.interest -= 1;
    player.mental -= 1;
  }

  hidden.caution = clamp(hidden.caution);
  hidden.interest = clamp(hidden.interest);
  hidden.vibe = clamp(hidden.vibe);
  hidden.timePressure = clamp(hidden.timePressure);
  player.mental = clamp(player.mental);
  player.observation = clamp(player.observation);

  const flowScore =
    hidden.interest +
    hidden.vibe -
    hidden.caution -
    Math.floor(hidden.timePressure / 2) +
    randomInt(-1, 1);

  let mood: OutcomeMood = 'mixed';
  if (choice.mine || hidden.caution >= 7 || flowScore <= -2) {
    mood = 'bad';
  } else if (flowScore >= 4) {
    mood = 'good';
  }

  const reply = [choice.replies[mood], ...notes].join(' ');

  return { hidden, player, mood, reply };
};

const decideEnding = (hidden: HiddenState, player: PlayerState, choice: Choice, mood: OutcomeMood, target: TargetProfile): Ending => {
  const warmth = hidden.interest + hidden.vibe - hidden.caution - Math.floor(hidden.timePressure / 2);
  const canStayLonger = hidden.interest >= 5 && hidden.vibe >= 4 && hidden.caution <= 3 && hidden.timePressure <= 5;
  const forcedBad = choice.mine || hidden.caution >= 7 || mood === 'bad';
  const riskyHotel = choice.id === 'konbini-hotel' || choice.id === 'hard-home';

  if (choice.id === 'cut-loss') {
    return endings.cutLoss;
  }

  if (choice.id === 'money-hotel') {
    return endings.moneyBad;
  }

  if (hasRisk(target, 'troubleRisk') && riskyHotel && (mood !== 'good' || hidden.caution >= 3 || hidden.timePressure >= 4 || player.observation <= 3)) {
    return endings.legalTrouble;
  }

  if (forcedBad) {
    return choice.tone === 'pushy' ? endings.powerBad : endings.fail;
  }

  if (choice.id === 'soft-home') {
    const successChance = clamp((warmth - 5) * 0.08 + (player.mental >= 3 ? 0.08 : -0.05), 0.03, 0.38);
    if (canStayLonger && Math.random() < successChance) {
      return endings.hotelDrink;
    }
    return warmth >= 3 ? endings.nextDay : warmth >= 1 ? endings.contact : endings.fail;
  }

  if (choice.id === 'konbini-hotel') {
    const successChance = clamp((warmth - 6) * 0.07 + (player.mental >= 4 ? 0.06 : -0.08), 0.02, 0.28);
    if (canStayLonger && hidden.caution <= 2 && Math.random() < successChance) {
      return endings.hotelKonbini;
    }
    return warmth >= 4 ? endings.nextDay : endings.fail;
  }

  if (choice.id === 'contact-close') {
    return warmth >= 2 ? endings.nextDay : warmth >= -1 ? endings.contact : endings.fail;
  }

  if (choice.id === 'hard-home') {
    if (hasRisk(target, 'powerRisk') || hidden.caution >= 4 || player.mental <= 2) {
      return endings.powerBad;
    }

    const successChance = clamp((warmth - 7) * 0.06 + (player.mental >= 5 ? 0.04 : -0.1), 0.01, 0.18);
    if (canStayLonger && hidden.caution <= 2 && Math.random() < successChance) {
      return endings.hotelDirect;
    }
    return warmth >= 4 ? endings.contact : endings.fail;
  }

  return warmth >= 4 && Math.random() < 0.15 ? endings.contact : endings.fail;
};

const getStatLabel = (value: number, labels: [string, string, string]) => {
  if (value <= 2) return labels[0];
  if (value <= 5) return labels[1];
  return labels[2];
};

const getHints = (snapshot: GameSnapshot) => {
  const { hidden, player } = snapshot;
  const hints: string[] = [];

  if (hasRisk(snapshot.target, 'moneyRisk')) {
    hints.push('金の話で流れを動かすと、ぼったくりやマネギラに寄りやすい。');
  } else if (hasRisk(snapshot.target, 'troubleRisk')) {
    hints.push('条件確認を飛ばすと後日のトラブルになりやすい。違和感が出たら損切り。');
  }

  if (hidden.caution >= 6) {
    hints.push('警戒が強い。前に出るほど離れそう。');
  } else if (hidden.caution >= 4) {
    hints.push('少し警戒しているかも。');
  } else {
    hints.push('距離感は今のところ崩れていない。');
  }

  if (player.observation >= 4) {
    if (hidden.timePressure >= 5) {
      hints.push('時間を気にしている仕草が増えた。');
    } else if (hidden.interest >= 5 && hidden.vibe >= 4) {
      hints.push('会話の温度は上がっている。急がない方がよさそう。');
    } else if (hidden.vibe <= 2) {
      hints.push('まだテンポが合いきっていない。');
    } else {
      hints.push('反応は悪くないが、決め手は薄い。');
    }
  } else {
    hints.push('細かい反応までは読み切れない。');
  }

  if (snapshot.player.mental <= 2) {
    hints.push('言葉が弱くなりやすい。短く整えたい。');
  }

  return hints.slice(0, 3);
};

const getChoiceText = (choice: Choice, mental: number) => {
  if (mental <= 2 && choice.lowMentalText) return choice.lowMentalText;
  return choice.text;
};

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
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => createInitialSnapshot(false));
  const step = scenario[snapshot.stepIndex];
  const hints = useMemo(() => getHints(snapshot), [snapshot]);
  const mentalLabel = getStatLabel(snapshot.player.mental, ['低い', '保っている', '安定']);
  const observationLabel = getStatLabel(snapshot.player.observation, ['鈍い', '普通', '冴えている']);
  const progress = snapshot.ending ? 100 : ((snapshot.stepIndex + 1) / scenario.length) * 100;
  const currentPlace = snapshot.target.area;

  useEffect(() => {
    setSnapshot(createInitialSnapshot());
  }, []);

  const choose = (choice: Choice) => {
    if (snapshot.ending) return;

    const result = applyChoice(snapshot, choice);
    const nextLogs = [
      ...snapshot.logs,
      {
        phase: step.phaseLabel,
        choiceText: getChoiceText(choice, snapshot.player.mental),
        reply: result.reply,
        mood: result.mood,
      },
    ];

    if (step.phase === 'close') {
      const ending = decideEnding(result.hidden, result.player, choice, result.mood, snapshot.target);
      setSnapshot({
        ...snapshot,
        player: result.player,
        hidden: result.hidden,
        lastReply: ending.finalReply ?? result.reply,
        lastMood: result.mood,
        logs: nextLogs,
        ending,
      });
      return;
    }

    if (result.hidden.caution >= 8) {
      setSnapshot({
        ...snapshot,
        player: result.player,
        hidden: result.hidden,
        lastReply: result.reply,
        lastMood: result.mood,
        logs: nextLogs,
        ending: choice.tone === 'pushy' ? endings.powerBad : endings.fail,
      });
      return;
    }

    setSnapshot({
      ...snapshot,
      stepIndex: snapshot.stepIndex + 1,
      player: result.player,
      hidden: result.hidden,
      lastReply: result.reply,
      lastMood: result.mood,
      logs: nextLogs,
    });
  };

  const restart = () => {
    setSnapshot(createInitialSnapshot());
  };

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-5 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-md border border-stone-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold text-teal-700">pua_memorial</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">{snapshot.ending ? snapshot.ending.title : currentPlace}</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">{snapshot.ending ? snapshot.ending.tone : `${step.phaseLabel} / Turn ${snapshot.stepIndex + 1} of ${scenario.length}`}</p>
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
                  <p className="mt-2 text-xl font-semibold leading-9 text-stone-950">{snapshot.ending ? snapshot.lastReply : step.npcLine}</p>
                </div>
              </div>

              {!snapshot.ending ? (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-stone-500">選択</p>
                    <p className="text-sm font-medium text-stone-500">次の返しを選ぶ</p>
                  </div>
                  <div className="grid gap-3">
                    {step.choices.map((choice, index) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => choose(choice)}
                        className="group grid min-h-[6.5rem] grid-cols-[2.75rem_1fr] items-start gap-3 rounded-md border-2 border-stone-200 bg-[#fcfcfb] p-4 text-left transition hover:-translate-y-0.5 hover:border-teal-700 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                        aria-label={`選択肢 ${index + 1}`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-base font-bold text-white transition group-hover:bg-teal-700">
                          {index + 1}
                        </span>
                        <span>
                          <span className="block text-lg font-bold leading-8 text-stone-950">{getChoiceText(choice, snapshot.player.mental)}</span>
                          <span className="mt-2 block border-l-2 border-stone-300 pl-3 text-sm leading-6 text-stone-600">{choice.intent}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-md bg-stone-950 px-5 py-3 text-base font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
                  >
                    もう一度遊ぶ
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="grid content-start gap-4 xl:sticky xl:top-5">
            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">今回の相手</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-stone-900">{snapshot.target.label}</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{snapshot.target.summary}</p>
            </section>

            <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold text-stone-950">曖昧なヒント</h2>
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
