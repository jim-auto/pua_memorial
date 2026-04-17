'use client';

import { useEffect, useMemo, useState } from 'react';
import { endings, scenario, type Choice, type Ending, type HiddenState, type OutcomeMood, type PlayerState } from '@/data/scenario';

type TurnLog = {
  phase: string;
  choiceText: string;
  reply: string;
  mood: OutcomeMood;
};

type GameSnapshot = {
  stepIndex: number;
  player: PlayerState;
  hidden: HiddenState;
  lastReply: string;
  lastMood: OutcomeMood | null;
  logs: TurnLog[];
  ending: Ending | null;
};

const clamp = (value: number, min = 0, max = 8) => Math.max(min, Math.min(max, value));
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const createInitialSnapshot = (randomized = true): GameSnapshot => ({
  stepIndex: 0,
  player: {
    mental: randomized ? randomInt(4, 6) : 5,
    observation: randomized ? randomInt(3, 5) : 4,
  },
  hidden: {
    caution: randomized ? randomInt(2, 4) : 3,
    interest: randomized ? randomInt(1, 3) : 2,
    vibe: randomized ? randomInt(1, 3) : 2,
    timePressure: randomized ? randomInt(1, 3) : 2,
  },
  lastReply: '深呼吸して、相手が立ち止まれる距離で声をかける。',
  lastMood: null,
  logs: [],
  ending: null,
});

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

const decideEnding = (hidden: HiddenState, player: PlayerState, choice: Choice, mood: OutcomeMood): Ending => {
  if (choice.mine || hidden.caution >= 7 || mood === 'bad') {
    return endings.fail;
  }

  const warmth = hidden.interest + hidden.vibe - hidden.caution - Math.floor(hidden.timePressure / 2);

  if (choice.id === 'soft-home') {
    const successChance = clamp((warmth - 5) * 0.08 + (player.mental >= 3 ? 0.08 : -0.05), 0.03, 0.38);
    if (hidden.interest >= 5 && hidden.vibe >= 4 && hidden.caution <= 3 && hidden.timePressure <= 5 && Math.random() < successChance) {
      return endings.success;
    }
    return warmth >= 2 ? endings.contact : endings.fail;
  }

  if (choice.id === 'contact-close') {
    return warmth >= -1 ? endings.contact : endings.fail;
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

function CharacterScene({ mood }: { mood: OutcomeMood | null }) {
  const womanMouth = mood === 'good' ? 'M118 155 Q132 166 146 155' : mood === 'bad' ? 'M118 163 Q132 153 146 163' : 'M118 158 Q132 161 146 158';
  const womanEye = mood === 'bad' ? '#2f2c29' : '#1f2933';

  return (
    <div className="relative h-64 overflow-hidden bg-stone-950 sm:h-80">
      <img
        src="/pua_memorial/shibuya-night.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-95"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/10" />
      <svg className="absolute bottom-0 left-1/2 h-64 w-[min(92%,34rem)] -translate-x-1/2" viewBox="0 0 520 260" role="img" aria-label="会話シーン">
        <ellipse cx="170" cy="248" rx="82" ry="10" fill="#0f0d0b" opacity="0.35" />
        <ellipse cx="376" cy="248" rx="82" ry="10" fill="#0f0d0b" opacity="0.35" />

        <g transform="translate(40 0)" aria-hidden="true">
          <path d="M72 245 C80 198 99 178 130 178 C162 178 181 198 188 245 Z" fill="#24201e" />
          <path d="M94 245 L107 188 L130 207 L153 188 L166 245 Z" fill="#3b332f" />
          <path d="M111 245 L120 199 L130 207 L140 199 L149 245 Z" fill="#e8e1d8" />
          <path d="M118 185 L130 207 L142 185 Z" fill="#f1b99e" />
          <path d="M88 95 C90 56 114 36 144 41 C174 47 188 73 180 113 C173 149 153 172 128 170 C102 168 86 137 88 95 Z" fill="#f0b99f" />
          <path d="M84 105 C80 71 95 44 128 34 C163 24 187 52 188 87 C168 86 151 77 136 62 C125 78 108 95 84 105 Z" fill="#211d1b" />
          <path d="M82 109 C73 101 70 116 78 130 C82 137 88 135 89 127" fill="#eaa98f" />
          <path d="M181 109 C191 100 193 116 185 130 C181 137 175 135 174 127" fill="#eaa98f" />
          <circle cx="112" cy="126" r="4" fill="#1f2933" />
          <circle cx="151" cy="126" r="4" fill="#1f2933" />
          <path d="M118 158 Q132 161 146 158" fill="none" stroke="#7a3f38" strokeWidth="4" strokeLinecap="round" />
          <path d="M103 111 Q113 106 123 110" stroke="#211d1b" strokeWidth="4" strokeLinecap="round" />
          <path d="M142 110 Q152 106 162 111" stroke="#211d1b" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g transform="translate(250 0)" aria-hidden="true">
          <path d="M72 245 C78 198 98 178 130 178 C162 178 182 198 188 245 Z" fill="#2a2522" />
          <path d="M82 245 C88 205 105 188 130 188 C155 188 172 205 178 245 Z" fill="#f3eee4" />
          <path d="M88 96 C91 55 115 34 145 42 C176 51 189 79 181 117 C174 151 154 174 128 172 C101 170 85 139 88 96 Z" fill="#f4c7ae" />
          <path d="M85 105 C78 63 101 33 133 29 C167 25 191 52 190 89 C170 86 148 76 132 57 C121 76 104 92 85 105 Z" fill="#2d2927" />
          <path d="M81 108 C72 99 69 114 77 128 C81 136 87 134 89 127" fill="#f0b99f" />
          <path d="M183 108 C193 99 195 114 187 128 C183 136 177 134 175 127" fill="#f0b99f" />
          <circle cx="112" cy="126" r="4" fill={womanEye} />
          <circle cx="151" cy="126" r="4" fill={womanEye} />
          <path d={womanMouth} fill="none" stroke="#7a3f38" strokeWidth="4" strokeLinecap="round" />
          <path d="M104 111 Q113 106 123 110" stroke="#2d2927" strokeWidth="4" strokeLinecap="round" />
          <path d="M142 110 Q152 106 161 111" stroke="#2d2927" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
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
      setSnapshot({
        ...snapshot,
        player: result.player,
        hidden: result.hidden,
        lastReply: result.reply,
        lastMood: result.mood,
        logs: nextLogs,
        ending: decideEnding(result.hidden, result.player, choice, result.mood),
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
        ending: endings.fail,
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
              <h1 className="mt-1 text-2xl font-bold leading-tight text-stone-950 sm:text-3xl">{snapshot.ending ? snapshot.ending.title : step.place}</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">{snapshot.ending ? snapshot.ending.tone : `${step.phaseLabel} / Turn ${snapshot.stepIndex + 1} of ${scenario.length}`}</p>
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

            <CharacterScene mood={snapshot.lastMood} />

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
                    <p className="text-sm font-medium text-stone-500">一番自然な返しを選ぶ</p>
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
