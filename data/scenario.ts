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
        text: 'すみません、ハチ公口ってこのまま真っすぐで合ってますか？',
        lowMentalText: 'すみません、ハチ公口だけ聞いてもいいですか。',
        intent: 'まず用件で止めて、相手が話せる状態か見る。',
        tone: 'soft',
        effect: { caution: -1, vibe: 1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「あ、そっちです。今日ほんと人多いですよね」少しだけ表情がゆるむ。',
          mixed: '「たぶんそっちです」答えは返るが、足は止まりきっていない。',
          bad: '「すみません、急いでるので」短く返して視線が流れる。',
        },
      },
      {
        id: 'honest',
        text: 'さっき一瞬目が合って、感じがよかったので声かけました。迷惑ならすぐ行きます。',
        lowMentalText: '感じがよくて声かけました。迷惑ならすぐ行きます。',
        intent: '声をかけた理由を出しつつ、逃げ道も先に置く。',
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
        text: 'このあと少しだけコーヒーでもどうですか。嫌なら全然大丈夫です。',
        lowMentalText: 'よかったら少しだけコーヒーとか、どうですか。',
        intent: '早めに打診する。通れば強いが、温度差があると重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 1, vibe: -1, timePressure: 1, mental: -1 },
        replies: {
          good: '「まだ早いですけど、ちゃんと聞くんですね」少しだけ笑う。',
          mixed: '「いきなりは行かないです」会話の温度は少し下がる。',
          bad: '「ごめんなさい、それは無理です」相手は距離を取る。',
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
        text: 'たまにです。今日は人が多すぎて、歩くだけで疲れますね。',
        lowMentalText: 'たまにです。今日、人多いですね。',
        intent: '質問で詰めず、共感しやすい話題へ広げる。',
        tone: 'curious',
        effect: { interest: 1, vibe: 2 },
        lowMentalEffect: { vibe: -1 },
        replies: {
          good: '「わかります。今日はほんと疲れます」会話の入口ができる。',
          mixed: '「たしかに多いですね」まだ様子見の返事。',
          bad: '「そうですね」広がりは弱い。',
        },
      },
      {
        id: 'give-space',
        text: '急いでたら止めちゃってすみません。大丈夫そうなら、あと一分だけ話してもいいですか。',
        lowMentalText: '急いでたらすみません。一分だけでも大丈夫ですか。',
        intent: '時間を小さく区切って、相手に決めてもらう。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 1, timePressure: -1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「一分なら」安心したのか、立ち止まる角度が変わる。',
          mixed: '「少しだけなら」会話の主導権は相手側に残る。',
          bad: '「ごめんなさい、今日は」丁寧に断られる。',
        },
      },
      {
        id: 'boyfriend',
        text: 'こういう声かけって、普段どう思います？正直に聞いてみたいです。',
        lowMentalText: 'こういう声かけ、嫌ですかね。',
        intent: '場をメタにする。ハマれば本音が出るが、距離も出やすい。',
        tone: 'pushy',
        effect: { caution: 1, interest: 1, vibe: -1, mental: -1 },
        replies: {
          good: '「言い方によりますね。今のはまだ大丈夫です」少し本音が出る。',
          mixed: '「ちょっと警戒はします」笑っているが、距離は残る。',
          bad: '「そういう話をされると困ります」会話が固くなる。',
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
        text: 'それはしんどいですね。今日はもう、誰かと話す気力も少なめですか？',
        lowMentalText: 'しんどそうですね。話す気力、少なめですか？',
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
        text: '仕事終わりの渋谷、もうラスボス前くらいの消耗感ありますよね。',
        lowMentalText: '仕事終わりの渋谷、かなり疲れますよね。',
        intent: '軽い比喩で空気を柔らかくする。',
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
        text: '疲れてる日に知らない人と話すの、普通に面倒ですよね。俺なら迷います。',
        lowMentalText: '疲れてる日に話しかけられるの、面倒ですよね。',
        intent: '相手側の違和感を先に言葉にする。刺されば安心になる。',
        tone: 'pushy',
        effect: { caution: -1, interest: 1, vibe: -1, timePressure: 1 },
        replies: {
          good: '「それわかってるなら、まだ話せます」少し警戒が解ける。',
          mixed: '「まあ、正直そうですね」本音は出るが温度は低い。',
          bad: '「じゃあ今日はここで」流れが切れる。',
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
        text: 'よかった。じゃあ、この空気が崩れないうちにちゃんと終わらせるのもありですね。',
        lowMentalText: 'よかったです。ちゃんと終わらせるのもありですね。',
        intent: '良い空気を認めつつ、相手の安心感を優先する。',
        tone: 'listen',
        effect: { caution: -2, interest: 1, vibe: 1, mental: 1 },
        replies: {
          good: '「そういう考え方なら安心です」相手の足が少しだけこちらに向く。',
          mixed: '「それはたしかに」悪くない間が続く。',
          bad: '「うん、でもそろそろ」終わりの空気も見えている。',
        },
      },
      {
        id: 'contact-now',
        text: 'もし今日ここで終わるなら、連絡先だけ交換できたらうれしいです。',
        lowMentalText: 'ここで終わるなら、連絡先だけでも。',
        intent: '終わりを前提にして、次の余地だけ聞く。',
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
        text: 'もう少しだけ歩きません？駅まででもいいので。',
        lowMentalText: '駅まででも、もう少し歩きませんか。',
        intent: '会話を延長する。自然にも見えるが、相手の疲れ次第で重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 0, vibe: -1, timePressure: 1, mental: -1 },
        replies: {
          good: '「駅までなら」条件付きで続きそうだ。',
          mixed: '「今日はここでいいです」線を引かれる。',
          bad: '「ごめんなさい、帰ります」会話は終わる。',
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
        text: 'このまま解散でもいいし、もう少し話すなら静かなカフェ探します。どっちが楽ですか？',
        lowMentalText: '解散でもいいし、少し話すならカフェ探します。どっちが楽ですか？',
        intent: '選択肢を並べて、相手が楽な方を選べるようにする。',
        tone: 'soft',
        effect: { caution: -2, interest: 1, vibe: 1, timePressure: -1, mental: 1 },
        replies: {
          good: '「カフェなら少しだけ」相手は条件を言葉にする。',
          mixed: '「今日は連絡先だけにしませんか」前向きだが、当日は進まない。',
          bad: '「今日は帰ります」距離は保たれる。',
        },
      },
      {
        id: 'contact-close',
        text: '今日はここで終わりにしましょう。楽しかったので、また話せたらうれしいです。',
        lowMentalText: '今日はここで終わりで大丈夫です。また話せたらうれしいです。',
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
        text: '正直もう少し一緒にいたいです。場所を変えるのはありですか？',
        lowMentalText: 'もう少し一緒にいたいです。場所変えるのはどうですか。',
        intent: '好意を強めに出す。空気が温まっていないと一気に重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 1, vibe: -1, timePressure: 1, mental: -1 },
        replies: {
          good: '「言い方は嫌じゃないです。でも場所は選びたいです」条件付きで残る。',
          mixed: '「今日はそこまでは」会話は終わりに向かう。',
          bad: '「それは無理です」そのまま離れていく。',
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
