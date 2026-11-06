import {
  endings, scenario, targetProfiles,
  type Choice, type Ending, type HiddenState, type OutcomeMood,
  type PlayerState, type SceneVisualKey, type TargetProfile, type TargetRisk,
} from '../data/scenario';

export type TurnLog = {
  phase: string;
  tone: Choice['tone'];
  feedback: string[];
  before: HiddenState;
  after: HiddenState;
  choiceText: string;
  reply: string;
  mood: OutcomeMood;
};

type HotelRoute = 'drink' | 'konbini' | 'direct' | null;

export type GameSnapshot = {
  seed: number;
  rngState: number;
  focus: number;
  observed: boolean;
  awaitingContinue: boolean;
  stepIndex: number;
  target: TargetProfile;
  hotelRoute: HotelRoute;
  player: PlayerState;
  hidden: HiddenState;
  lastReply: string;
  lastMood: OutcomeMood | null;
  logs: TurnLog[];
  ending: Ending | null;
};

const clamp = (value: number, min = 0, max = 8) => Math.max(min, Math.min(max, value));
// Keep the random stream in each run so a retry reproduces the same encounter.
const createRandom = (initial: number) => {
  let state = initial >>> 0;
  return {
    int(min: number, max: number) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return min + Math.floor((state / 4294967296) * (max - min + 1));
    },
    get state() { return state; },
  };
};

const hasRisk = (target: TargetProfile, risk: TargetRisk) => target.risks?.includes(risk) ?? false;
const getHotelRoute = (choiceId: string): HotelRoute => {
  if (choiceId === 'soft-home') return 'drink';
  if (choiceId === 'konbini-hotel') return 'konbini';
  if (choiceId === 'hard-home') return 'direct';
  return null;
};

const resolveChoiceForScene = (choice: Choice, visualKey: SceneVisualKey): Choice => {
  const copy = choice.sceneCopies?.[visualKey];

  if (!copy) return choice;

  return {
    ...choice,
    ...copy,
    replies: {
      ...choice.replies,
      ...(copy.replies ?? {}),
    },
  };
};

export const resolveStepForScene = (step: (typeof scenario)[number], visualKey: SceneVisualKey) => {
  const copy = step.sceneCopies?.[visualKey];

  return {
    ...step,
    ...copy,
    choices: step.choices.map((choice) => resolveChoiceForScene(choice, visualKey)),
  };
};

export const createInitialSnapshot = (seed = Math.floor(Math.random() * 4294967296)): GameSnapshot => {
  const random = createRandom(seed);
  const target = targetProfiles[random.int(0, targetProfiles.length - 1)];
  const modifier = target.modifier;
  const player = {
    mental: clamp(random.int(4, 6) + (modifier.mental ?? 0)),
    observation: clamp(random.int(3, 5) + (modifier.observation ?? 0)),
  };
  const hidden = {
    caution: clamp(random.int(2, 4) + (modifier.caution ?? 0)),
    interest: clamp(random.int(1, 3) + (modifier.interest ?? 0)),
    vibe: clamp(random.int(1, 3) + (modifier.vibe ?? 0)),
    timePressure: clamp(random.int(1, 3) + (modifier.timePressure ?? 0)),
  };
  return {
    seed, rngState: random.state, focus: 2, observed: false, awaitingContinue: false,
    stepIndex: 0, target, hotelRoute: null, player, hidden,
    lastReply: `${target.label}。${target.summary}`,
    lastMood: null, logs: [], ending: null,
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

  // Every reply takes time; concise replies can offset this with their own effect.
  hidden.timePressure += 1;
  const random = createRandom(snapshot.rngState);
  const feedback: string[] = [];
  const previous = snapshot.logs.at(-1);
  const repeating = snapshot.logs.length >= 2 && snapshot.logs.slice(-2).every((log) => log.tone === choice.tone);

  if (repeating) {
    hidden.interest -= Math.max(0, effect.interest);
    hidden.vibe -= Math.max(0, effect.vibe);
    feedback.push('同じ調子が続き、会話が広がらなかった。');
  } else if (previous?.tone === 'curious' && choice.tone === 'listen') {
    hidden.interest += 1;
    player.observation += 1;
    feedback.push('聞いてから受け止めたことで、話がつながった。');
  } else if (previous?.tone === 'listen' && choice.tone === 'playful' && snapshot.hidden.vibe >= 3 && snapshot.hidden.caution <= 4) {
    hidden.vibe += 1;
    feedback.push('受け止めた後の軽い冗談で、空気がほぐれた。');
  }

  if (!repeating && choice.tone === 'withdraw' && snapshot.hidden.caution >= 4) {
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

  if (!repeating && choice.tone === 'listen' && snapshot.hidden.vibe >= 3) {
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
    random.int(-1, 1);

  let mood: OutcomeMood = 'mixed';
  if (choice.mine || hidden.caution >= 7 || flowScore <= -2) {
    mood = 'bad';
  } else if (flowScore >= 4) {
    mood = 'good';
  }

  const reply = [choice.replies[mood], ...notes].join(' ');

  return { hidden, player, mood, reply, feedback, rngState: random.state };
};

const decideHotelRouteBlock = (hidden: HiddenState, player: PlayerState, choice: Choice, mood: OutcomeMood, target: TargetProfile): Ending | null => {
  const forcedBad = choice.mine || hidden.caution >= 7 || mood === 'bad';
  const riskyHotel = choice.id === 'konbini-hotel' || choice.id === 'hard-home';

  if (hasRisk(target, 'troubleRisk') && riskyHotel && (mood !== 'good' || hidden.caution >= 3 || hidden.timePressure >= 4 || player.observation <= 3)) {
    return endings.legalTrouble;
  }

  if (forcedBad) {
    return choice.tone === 'pushy' ? endings.powerBad : endings.fail;
  }

  if (choice.id === 'hard-home' && (hasRisk(target, 'powerRisk') || hidden.caution >= 4 || player.mental <= 2)) {
    return endings.powerBad;
  }

  return null;
};

const decideEnding = (hidden: HiddenState, choice: Choice, mood: OutcomeMood): Ending => {
  const warmth = hidden.interest + hidden.vibe - hidden.caution - Math.floor(hidden.timePressure / 2);
  const forcedBad = choice.mine || hidden.caution >= 7 || mood === 'bad';

  if (choice.id === 'cut-loss') {
    return endings.cutLoss;
  }

  if (choice.id === 'money-hotel') {
    return endings.moneyBad;
  }

  if (forcedBad) {
    return choice.tone === 'pushy' ? endings.powerBad : endings.fail;
  }

  return warmth >= 2 ? endings.nextDay : warmth >= -1 ? endings.contact : endings.fail;
};

const decideHotelEnding = (hotelRoute: HotelRoute, hidden: HiddenState, player: PlayerState, choice: Choice, mood: OutcomeMood, target: TargetProfile): Ending => {
  const warmth = hidden.interest + hidden.vibe - hidden.caution - Math.floor(hidden.timePressure / 2);
  const canProceed = hidden.interest >= 4 && hidden.vibe >= 3 && hidden.caution <= 4 && player.mental >= 2;

  if (choice.id === 'hotel-final-next-day') {
    return warmth >= 1 ? endings.nextDay : endings.contact;
  }

  if (choice.id === 'hotel-final-push') {
    if (hasRisk(target, 'troubleRisk') || hasRisk(target, 'moneyRisk') || hidden.caution >= 3 || player.observation <= 3) {
      return endings.legalTrouble;
    }
    return endings.powerBad;
  }

  if (choice.mine || hidden.caution >= 7 || mood === 'bad') {
    return choice.tone === 'pushy' ? endings.powerBad : warmth >= 1 ? endings.nextDay : endings.fail;
  }

  if (!canProceed || mood !== 'good') {
    return warmth >= 1 ? endings.nextDay : endings.fail;
  }

  if (hasRisk(target, 'troubleRisk') && hidden.caution >= 3 && choice.id !== 'hotel-final-next-day') {
    return endings.legalTrouble;
  }

  if (choice.id === 'hotel-final-supplies' || hotelRoute === 'konbini') {
    return endings.hotelKonbini;
  }

  if (hotelRoute === 'direct') {
    return endings.hotelDirect;
  }

  return endings.hotelDrink;
};

export const getStatLabel = (value: number, labels: [string, string, string]) => {
  if (value <= 2) return labels[0];
  if (value <= 5) return labels[1];
  return labels[2];
};

export const getHints = (snapshot: GameSnapshot) => {
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

  return hints;
};

export const getChoiceText = (choice: Choice, mental: number) => {
  if (mental <= 2 && choice.lowMentalText) return choice.lowMentalText;
  return choice.text;
};

export const toneLabels: Record<Choice['tone'], string> = {
  soft: 'やわらかく伝える', curious: '質問する', listen: '受け止める',
  playful: '軽く笑いにする', withdraw: '余白をつくる', pushy: '踏み込む',
};

export const useFocus = (snapshot: GameSnapshot, action: 'observe' | 'breathe'): GameSnapshot => {
  if (snapshot.ending || snapshot.awaitingContinue || snapshot.focus <= 0) return snapshot;
  if (action === 'observe' && snapshot.observed) return snapshot;
  if (action === 'breathe' && snapshot.player.mental >= 8) return snapshot;
  return {
    ...snapshot,
    focus: snapshot.focus - 1,
    observed: snapshot.observed || action === 'observe',
    player: {
      mental: clamp(snapshot.player.mental + (action === 'breathe' ? 3 : 0)),
      observation: clamp(snapshot.player.observation + (action === 'observe' ? 2 : 0)),
    },
  };
};

export const getObservation = ({ hidden }: GameSnapshot) => [
  hidden.caution >= 5 ? '体が外を向いている。まずは距離と安心感が必要そう。'
    : hidden.caution >= 3 ? '足は止まったが、まだ距離を測っている。'
    : '肩の力が抜けている。警戒は薄そう。',
  hidden.vibe >= 4 ? '返事のテンポが軽い。短い冗談にも反応しそう。'
    : '返事はまだ短い。まず話を受け止める余地がありそう。',
  hidden.timePressure >= 5 ? '何度も時計を見ている。延長より、今のうちに着地を。'
    : '頻繁に時計を見る様子はない。会話を広げる余裕はありそう。',
];

export const playChoice = (snapshot: GameSnapshot, choiceId: string): GameSnapshot => {
  if (snapshot.ending || snapshot.awaitingContinue) return snapshot;
  const step = resolveStepForScene(scenario[snapshot.stepIndex], snapshot.target.visualKey);
  const choice = step.choices.find((item) => item.id === choiceId);
  if (!choice) return snapshot;
  const result = applyChoice(snapshot, choice);
  const logs: TurnLog[] = [...snapshot.logs, {
    phase: step.phaseLabel, tone: choice.tone,
    choiceText: getChoiceText(choice, snapshot.player.mental),
    reply: result.reply, mood: result.mood, feedback: result.feedback,
    before: { ...snapshot.hidden }, after: { ...result.hidden },
  }];
  let ending: Ending | null = null;
  let hotelRoute = snapshot.hotelRoute;

  if (choice.id === 'contact-now') {
    const warmth = result.hidden.interest + result.hidden.vibe - result.hidden.caution - Math.floor(result.hidden.timePressure / 2);
    ending = result.mood !== 'bad' && warmth >= -1 ? endings.contact : endings.fail;
  } else if (step.phase === 'close') {
    hotelRoute = getHotelRoute(choice.id);
    ending = hotelRoute
      ? decideHotelRouteBlock(result.hidden, result.player, choice, result.mood, snapshot.target)
      : decideEnding(result.hidden, choice, result.mood);
  } else if (step.phase === 'hotel') {
    ending = decideHotelEnding(hotelRoute, result.hidden, result.player, choice, result.mood, snapshot.target);
  } else if (result.hidden.caution >= 8 || (result.mood === 'bad' && snapshot.lastMood === 'bad')) {
    ending = choice.tone === 'pushy' ? endings.powerBad : endings.fail;
  } else if (result.hidden.timePressure >= 8) {
    ending = endings.fail;
  }

  return {
    ...snapshot, hidden: result.hidden, player: result.player, rngState: result.rngState,
    lastMood: result.mood, lastReply: ending?.finalReply ?? result.reply,
    logs, hotelRoute, ending, awaitingContinue: !ending,
  };
};

export const continueConversation = (snapshot: GameSnapshot): GameSnapshot => {
  if (!snapshot.awaitingContinue || snapshot.ending) return snapshot;
  return { ...snapshot, stepIndex: snapshot.stepIndex + 1, awaitingContinue: false, observed: false };
};

export const getDebrief = (snapshot: GameSnapshot): string[] => {
  const notes: string[] = [];
  if (snapshot.ending?.id === 'contact') notes.push('会話を長引かせず、次につながるところで着地できた。');
  if (snapshot.ending?.id === 'cutLoss') notes.push('違和感に合わせて会話を終える判断ができた。');
  if (snapshot.hidden.caution >= 5) notes.push('警戒が残った。次は踏み込む前に、相手が断れる余白をつくろう。');
  if (snapshot.hidden.timePressure >= 6) notes.push('時間の余裕が少なかった。短い返答や、早めの連絡先交換も選べる。');
  if (snapshot.player.mental <= 2) notes.push('メンタルが落ちて返答が弱くなった。集中力を深呼吸に使う手もある。');
  if (snapshot.logs.some((log) => log.feedback.some((note) => note.startsWith('同じ調子')))) {
    notes.push('同じ調子を3回続けると、興味とノリの上昇が止まる。質問の後に受け止めるなど、返しをつなげよう。');
  }
  if (snapshot.logs.some((log) => log.feedback.some((note) => !note.startsWith('同じ調子')))) {
    notes.push('返しの組み合わせが効いた。相手の話を聞き、その内容を受け止めると会話がつながる。');
  }
  if (notes.length === 0) notes.push('同じ相手に再挑戦すると、初期状態と反応の揺れは同じ。別の返しを試して違いを見てみよう。');
  return notes;
};
