export type PhaseId = 'approach' | 'talk1' | 'talk2' | 'talk3' | 'close';

export type HiddenState = {
  caution: number;
  interest: number;
  vibe: number;
  timePressure: number;
};

export type PlayerState = {
  mental: number;
  observation: number;
};

export type GameEffect = Partial<HiddenState & PlayerState>;

export type ChoiceTone = 'soft' | 'curious' | 'listen' | 'playful' | 'withdraw' | 'pushy';

export type OutcomeMood = 'good' | 'mixed' | 'bad';

export type Choice = {
  id: string;
  text: string;
  lowMentalText?: string;
  intent: string;
  tone: ChoiceTone;
  effect: GameEffect;
  lowMentalEffect?: GameEffect;
  mine?: boolean;
  replies: Record<OutcomeMood, string>;
};

export type ScenarioStep = {
  phase: PhaseId;
  phaseLabel: string;
  place: string;
  npcLine: string;
  narration: string;
  choices: Choice[];
};

export type EndingId = 'fail' | 'contact' | 'success';

export type Ending = {
  id: EndingId;
  title: string;
  body: string;
  tone: string;
};

export const scenario: ScenarioStep[] = [
  {
    phase: 'approach',
    phaseLabel: '声かけ',
    place: '渋谷スクランブル',
    narration: '人波が切れた一瞬。相手はイヤホンを片方だけ外して、こちらを見る。',
    npcLine: '「はい？」',
    choices: [
      {
        id: 'ask-way',
        text: '急にすみません。駅ってこっちで合ってますか？',
        lowMentalText: 'あ、すみません。駅だけ聞いてもいいですか。',
        intent: '用件を短く伝えて、すぐ引ける距離を保つ。',
        tone: 'soft',
        effect: { caution: -1, vibe: 1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「あ、そっちです。人多いですよね」少しだけ表情がゆるむ。',
          mixed: '「たぶんそっちです」答えは返るが、足は止まりきっていない。',
          bad: '「ちょっと急いでるので」短く返して視線が流れる。',
        },
      },
      {
        id: 'honest',
        text: '雰囲気が素敵で、少しだけ話したいと思いました。無理なら大丈夫です。',
        lowMentalText: '変な意味じゃなくて、少しだけ話せたらと思って。無理なら大丈夫です。',
        intent: '好意は出すが、断れる余白を先に置く。',
        tone: 'curious',
        effect: { caution: 1, interest: 2, vibe: 1, mental: 1 },
        lowMentalEffect: { caution: 1, vibe: -1 },
        replies: {
          good: '「え、急ですね。でも言い方はちゃんとしてますね」警戒は残るが会話は続く。',
          mixed: '「少しだけなら」距離は保ったまま、反応を見ている。',
          bad: '「ごめんなさい、そういうのは」きっぱり距離を取られる。',
        },
      },
      {
        id: 'instant-drink',
        text: '今から飲みに行こうよ。近いし。',
        lowMentalText: 'よかったら今から飲みとか、どうですか。',
        intent: '関係ができる前に予定を奪いにいく。',
        tone: 'pushy',
        effect: { caution: 3, interest: -1, vibe: -1, timePressure: 1, mental: -1 },
        mine: true,
        replies: {
          good: '「いきなりそれは無理です」笑ってはいるが、明確に線を引かれる。',
          mixed: '「知らない人とは行かないです」会話の温度が下がる。',
          bad: '「無理です」相手はそのまま歩き出す。',
        },
      },
    ],
  },
  {
    phase: 'talk1',
    phaseLabel: '会話 1',
    place: 'センター街入口',
    narration: '大型ビジョンの音が遠くに混じる。相手はスマホを一度見て、またこちらを向く。',
    npcLine: '「この辺、よく来るんですか？」',
    choices: [
      {
        id: 'mirror-question',
        text: 'たまにです。そちらは買い物帰りですか？',
        lowMentalText: 'たまにです。えっと、買い物帰りですか？',
        intent: '相手の流れに合わせて、軽い質問で返す。',
        tone: 'curious',
        effect: { interest: 1, vibe: 1 },
        lowMentalEffect: { vibe: -1 },
        replies: {
          good: '「そうです。今日は人が多すぎて疲れました」会話の入口ができる。',
          mixed: '「まあ、そんな感じです」まだ様子見の返事。',
          bad: '「急いでるので」質問は広がらない。',
        },
      },
      {
        id: 'give-space',
        text: '急いでそうならここで大丈夫です。少しだけ話せたらうれしいです。',
        lowMentalText: '急いでたら大丈夫です。すみません。',
        intent: '相手の時間を優先して、引く余地を明確にする。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「それなら少しだけ」安心したのか、立ち止まる角度が変わる。',
          mixed: '「少しだけなら」会話の主導権は相手側に残る。',
          bad: '「ごめんなさい、今日は」丁寧に断られる。',
        },
      },
      {
        id: 'boyfriend',
        text: '彼氏いるんですか？',
        lowMentalText: 'あの、彼氏とかいますか。',
        intent: '関係が浅い段階で踏み込みすぎる。',
        tone: 'pushy',
        effect: { caution: 3, interest: -2, vibe: -2, mental: -1 },
        mine: true,
        replies: {
          good: '「それ、今聞きます？」空気が少し固まる。',
          mixed: '「秘密です」笑っているが、会話は閉じ気味になる。',
          bad: '「そういうの無理です」完全に距離を置かれる。',
        },
      },
    ],
  },
  {
    phase: 'talk2',
    phaseLabel: '会話 2',
    place: '井の頭通り',
    narration: '少しだけ歩幅が合う。相手は人混みを避けるように端へ寄った。',
    npcLine: '「最近、仕事終わりずっと疲れてて」',
    choices: [
      {
        id: 'listen-fatigue',
        text: 'それはしんどいですね。今日は早く帰りたい感じですか？',
        lowMentalText: 'しんどそうですね。今日は帰りたい感じですか？',
        intent: '相手の状態を優先し、続けるかどうかを確認する。',
        tone: 'listen',
        effect: { caution: -1, interest: 1, vibe: 1, timePressure: -1 },
        replies: {
          good: '「そう聞いてくれるの助かる」相手の声が少し柔らかくなる。',
          mixed: '「まあ、疲れてはいます」まだ判断中の様子。',
          bad: '「だからあんまり話せないかも」無理に広げる空気ではない。',
        },
      },
      {
        id: 'light-joke',
        text: '渋谷の人混み、HP削ってきますよね。',
        lowMentalText: '人混みって疲れますよね。',
        intent: '軽さを出しつつ、相手の反応を見る。',
        tone: 'playful',
        effect: { interest: 1, vibe: 2, mental: 1 },
        lowMentalEffect: { vibe: -1 },
        replies: {
          good: '「わかる、もうHP赤です」笑いが少し混じる。',
          mixed: '「たしかに」反応は悪くないが、まだ浅い。',
          bad: '「そうですね」笑いには乗ってこない。',
        },
      },
      {
        id: 'self-talk',
        text: '自分も忙しくて。俺の仕事、けっこう特殊でさ。',
        lowMentalText: '自分も疲れてて、仕事がけっこう大変で。',
        intent: '相手の話を受けず、自分の話に持っていく。',
        tone: 'pushy',
        effect: { caution: 1, interest: -1, vibe: -2, timePressure: 1 },
        mine: true,
        replies: {
          good: '「へえ」相づちはあるが、相手の目線が外れる。',
          mixed: '「そうなんですね」会話が一方通行になる。',
          bad: '「そろそろ行きますね」流れが切れる。',
        },
      },
    ],
  },
  {
    phase: 'talk3',
    phaseLabel: '会話 3',
    place: '宇田川町の横断歩道',
    narration: '信号待ちで会話が止まる。沈黙は気まずさにも、余白にもなりそうだ。',
    npcLine: '「なんか、思ったより普通に話せますね」',
    choices: [
      {
        id: 'honest-normal',
        text: 'そう言ってもらえるならよかった。無理に引き止めるつもりはないです。',
        lowMentalText: 'よかったです。無理に引き止めるつもりはないので。',
        intent: '良い空気を認めつつ、相手の安心感を優先する。',
        tone: 'listen',
        effect: { caution: -1, interest: 1, vibe: 1, mental: 1 },
        replies: {
          good: '「そこは安心しました」相手の足が少しだけこちらに向く。',
          mixed: '「それなら」悪くない間が続く。',
          bad: '「うん、でもそろそろ」終わりの空気も見えている。',
        },
      },
      {
        id: 'contact-now',
        text: '今日はここまでにして、よければ連絡先だけ交換しませんか。',
        lowMentalText: '迷惑じゃなければ、連絡先だけでも。',
        intent: '当日の進展より、次につながる自然さを選ぶ。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, timePressure: -1, mental: 1 },
        replies: {
          good: '「それくらいなら」無理のない着地が見える。',
          mixed: '「少し考えます」断られてはいないが、慎重さは残る。',
          bad: '「ごめんなさい、連絡先は」ここで終わる流れになる。',
        },
      },
      {
        id: 'pressure-time',
        text: '終電までまだあるし、もう少し一緒にいけるでしょ。',
        lowMentalText: 'まだ時間ありますよね。もう少しだけどうですか。',
        intent: '相手の判断を先回りして押す。',
        tone: 'pushy',
        effect: { caution: 3, interest: -1, vibe: -2, timePressure: 1, mental: -1 },
        mine: true,
        replies: {
          good: '「そういう言い方はちょっと」空気が急に冷える。',
          mixed: '「いや、帰ります」線を引かれる。',
          bad: '「無理です」会話は終わる。',
        },
      },
    ],
  },
  {
    phase: 'close',
    phaseLabel: '打診',
    place: '神南の路地',
    narration: '人通りが少し落ち着き、会話のテンポもゆっくりになる。最後の選び方で流れが決まる。',
    npcLine: '「このあと、どうします？」',
    choices: [
      {
        id: 'soft-home',
        text: '無理がなければ、うちで温かいお茶でも。少しでも迷うなら今日は連絡先だけにしましょう。',
        lowMentalText: 'もし無理じゃなければ、少しだけ場所を変えるのもありです。迷うなら連絡先だけで。',
        intent: '選択権を相手に残し、断りやすさを明示して打診する。',
        tone: 'soft',
        effect: { caution: -1, interest: 1, vibe: 1, mental: -1 },
        replies: {
          good: '「ちゃんと聞いてくれるなら、少しだけなら」相手は条件を言葉にする。',
          mixed: '「今日は連絡先だけにしませんか」前向きだが、当日は進まない。',
          bad: '「ごめんなさい、それはまだ」距離は保たれる。',
        },
      },
      {
        id: 'contact-close',
        text: '今日はここで解散しましょう。楽しかったので、よければまた話したいです。',
        lowMentalText: '今日はここで大丈夫です。よければまた話せたら。',
        intent: '一番自然な着地を優先する。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 1, mental: 1 },
        replies: {
          good: '「それがいいかも。連絡先、交換します？」安心した表情になる。',
          mixed: '「そうですね」余韻は残る。',
          bad: '「今日はありがとうございました」丁寧に終わる。',
        },
      },
      {
        id: 'hard-home',
        text: 'もう家行こう。ここまで話したし大丈夫でしょ。',
        lowMentalText: '家とか、だめですか。ここまで話したので。',
        intent: '同意を確認せず、流れを自分の都合で決める。',
        tone: 'pushy',
        effect: { caution: 4, interest: -2, vibe: -2, mental: -2 },
        mine: true,
        replies: {
          good: '「大丈夫ではないです」相手は表情を閉じる。',
          mixed: '「そういうことなら帰ります」会話が終わる。',
          bad: '「無理です」そのまま離れていく。',
        },
      },
    ],
  },
];

export const endings: Record<EndingId, Ending> = {
  fail: {
    id: 'fail',
    title: '解散',
    tone: '空気を読みきれなかった',
    body: '相手は丁寧に距離を取り、そのまま人混みに戻っていった。押すほど流れは遠のく。今日はここで終わり。',
  },
  contact: {
    id: 'contact',
    title: '連絡先交換',
    tone: '良い余韻で終わった',
    body: '当日は進まなかったが、相手は安心した様子で連絡先を交換してくれた。次につながる自然な終わり方になった。',
  },
  success: {
    id: 'success',
    title: '自然な流れ',
    tone: 'レア成功',
    body: '相手は少し考えてから、自分の条件を伝えてくれた。無理のない確認を重ねながら、二人は静かな通りへ歩き出した。',
  },
};
