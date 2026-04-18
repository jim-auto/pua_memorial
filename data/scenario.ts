export type PhaseId = 'approach' | 'talk1' | 'talk2' | 'talk3' | 'close' | 'hotel';

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

export type SceneVisualKey = 'shibuya' | 'kabukicho' | 'ikebukuro' | 'club';

export type ChoiceSceneCopy = {
  text: string;
  lowMentalText?: string;
  intent: string;
  replies?: Partial<Record<OutcomeMood, string>>;
};

export type StepSceneCopy = {
  narration: string;
  npcLine: string;
};

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
  sceneCopies?: Partial<Record<SceneVisualKey, ChoiceSceneCopy>>;
};

export type ScenarioStep = {
  phase: PhaseId;
  phaseLabel: string;
  place: string;
  npcLine: string;
  narration: string;
  choices: Choice[];
  sceneCopies?: Partial<Record<SceneVisualKey, StepSceneCopy>>;
};

export type TargetRisk = 'powerRisk' | 'troubleRisk' | 'moneyRisk';

export type TargetProfileId = 'office' | 'friendly' | 'guarded' | 'hurried' | 'kabukicho' | 'ikebukuro' | 'club' | 'trouble';

export type TargetProfile = {
  id: TargetProfileId;
  label: string;
  area: string;
  visualKey: SceneVisualKey;
  summary: string;
  modifier: GameEffect;
  risks?: TargetRisk[];
};

export type EndingId =
  | 'fail'
  | 'contact'
  | 'nextDay'
  | 'hotelDrink'
  | 'hotelKonbini'
  | 'hotelDirect'
  | 'powerBad'
  | 'legalTrouble'
  | 'moneyBad'
  | 'cutLoss';

export type Ending = {
  id: EndingId;
  title: string;
  body: string;
  tone: string;
  finalReply?: string;
};

export const targetProfiles: TargetProfile[] = [
  {
    id: 'office',
    label: 'しごおわ普通',
    area: '渋谷スクランブル',
    visualKey: 'shibuya',
    summary: '反応は読みやすい。雑に押すと普通に冷める。',
    modifier: {},
  },
  {
    id: 'friendly',
    label: 'ノリ良い友達待ち',
    area: 'センター街入口',
    visualKey: 'shibuya',
    summary: '笑いは拾うが、待ち合わせ前で時間は短い。',
    modifier: { caution: -1, interest: 1, vibe: 2, timePressure: 1 },
  },
  {
    id: 'guarded',
    label: '警戒強めソロ',
    area: '神南の横断歩道',
    visualKey: 'shibuya',
    summary: '引き際を見せないとすぐ固まる。圧に弱い。',
    modifier: { caution: 2, vibe: -1, observation: 1 },
    risks: ['powerRisk'],
  },
  {
    id: 'hurried',
    label: '終電前しごおわ',
    area: '井の頭通り',
    visualKey: 'shibuya',
    summary: '時間圧が強い。短く刺せないと終わる。',
    modifier: { caution: 1, timePressure: 2, mental: -1 },
  },
  {
    id: 'kabukicho',
    label: '歌舞伎町の女',
    area: '歌舞伎町入口',
    visualKey: 'kabukicho',
    summary: 'ノリは強いが、金の話に寄せると別ゲームになる。',
    modifier: { interest: 2, vibe: 1, caution: 1, timePressure: 1 },
    risks: ['moneyRisk', 'troubleRisk'],
  },
  {
    id: 'ikebukuro',
    label: '池袋の女',
    area: '池袋西口',
    visualKey: 'ikebukuro',
    summary: '落ち着いて見えるが、雑な打診には反応が薄い。',
    modifier: { interest: 1, timePressure: 1, observation: 1 },
  },
  {
    id: 'club',
    label: 'クラブ帰り',
    area: 'クラブ前',
    visualKey: 'club',
    summary: 'テンションは高いが、音と仲間の流れで判断がブレやすい。',
    modifier: { caution: 1, interest: 1, vibe: 2, timePressure: 1, mental: -1 },
    risks: ['powerRisk'],
  },
  {
    id: 'trouble',
    label: '怪しい女',
    area: '道玄坂の路地前',
    visualKey: 'shibuya',
    summary: '乗っているように見えるが、条件確認を飛ばすと事故る。',
    modifier: { caution: -1, interest: 2, vibe: 1, timePressure: 1 },
    risks: ['troubleRisk'],
  },
];

export const scenario: ScenarioStep[] = [
  {
    phase: 'approach',
    phaseLabel: '声かけ',
    place: '渋谷スクランブル',
    narration: '人波が切れた一瞬。相手はイヤホンを片方だけ外して、こちらを見る。',
    npcLine: '「はい？」',
    sceneCopies: {
      kabukicho: {
        narration: '赤い看板の光が濡れた路面に滲む。相手は店前の人波を避けながら、こちらに一瞬だけ目を向けた。',
        npcLine: '「なに？」',
      },
      ikebukuro: {
        narration: '西口のロータリーにバスの音が混じる。相手は改札側を確認してから、少しだけ足を止めた。',
        npcLine: '「どうしました？」',
      },
      club: {
        narration: '低音がドアの外まで漏れている。相手は友達の位置を目で追いながら、こちらの声に反応した。',
        npcLine: '「ん？なに？」',
      },
    },
    choices: [
      {
        id: 'ask-way',
        text: 'しごおわですか？その顔、疲れてるのにちゃんとしてて逆に目立ってます。',
        lowMentalText: 'しごおわですか？疲れてそうなのに、ちゃんとしてますね。',
        intent: '予定確認と短い褒めを同時に入れて、反応の温度を見る。',
        tone: 'soft',
        effect: { caution: 0, interest: 1, vibe: 1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「しごおわです。褒め方ちょっと変ですね」少しだけ表情がゆるむ。',
          mixed: '「まあ、仕事帰りです」答えは返るが、足は止まりきっていない。',
          bad: '「すみません、急いでるので」短く返して視線が流れる。',
        },
        sceneCopies: {
          kabukicho: {
            text: '仕事終わりですか？この辺でその落ち着き方してる人、逆に目立ってました。',
            lowMentalText: '仕事終わりですか？落ち着いて見えたので声かけました。',
            intent: '歌舞伎町の派手さと対比して、相手の落ち着きを短く拾う。',
          },
          ikebukuro: {
            text: '西口よく使う人ですか？人多いのに歩き方落ち着いてて目に入りました。',
            lowMentalText: '西口よく使います？落ち着いて見えたので声かけました。',
            intent: '池袋の駅前感に合わせて、慣れと雰囲気を自然に褒める。',
          },
          club: {
            text: 'クラブ帰りですか？音の外出た瞬間、急に冷静な顔してたの面白くて。',
            lowMentalText: 'クラブ帰りですか？外出た瞬間の顔が冷静でした。',
            intent: 'クラブ後のテンション差を拾って、軽い笑いから入る。',
          },
        },
      },
      {
        id: 'honest',
        text: 'ごめん一個だけ。今の歩き方、この辺慣れてる人っぽかった。駅こっちで合ってます？',
        lowMentalText: 'すみません一個だけ。駅こっちで合ってます？',
        intent: '軽い観察から入って、道聞きに逃がせる形にする。',
        tone: 'curious',
        effect: { caution: -1, interest: 1, vibe: 1, mental: 1 },
        lowMentalEffect: { caution: 1, vibe: -1 },
        replies: {
          good: '「この辺慣れてる人って何ですか」少し笑って、指で方向を示す。',
          mixed: '「たぶんそっちです」距離は保ったまま答えてくれる。',
          bad: '「わからないです」会話を広げる空気ではない。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'ごめん一個だけ。こっちって大通り戻る道で合ってます？歩き方が慣れてそうだったので。',
            lowMentalText: 'すみません。大通り戻るならこっちで合ってます？',
            intent: '歌舞伎町の導線確認にして、会話へ逃げ道を残す。',
          },
          ikebukuro: {
            text: 'ごめん一個だけ。西口から駅戻るならこっちで合ってます？この辺詳しそうで。',
            lowMentalText: 'すみません。駅戻るならこっちで合ってます？',
            intent: '池袋西口の駅導線をきっかけに、自然な短い会話へ入る。',
          },
          club: {
            text: 'ごめん一個だけ。出口混んでるけど、駅ってこっち抜けるのが早いですか？',
            lowMentalText: 'すみません。駅ってこっちで合ってます？',
            intent: 'クラブ前の混雑に合わせて、道聞きとして自然に入る。',
          },
        },
      },
      {
        id: 'instant-drink',
        text: 'このあと予定なければ一杯だけどうですか。10分で帰していいです。',
        lowMentalText: '予定なければ一杯だけ、どうですか。',
        intent: '早めの連れ出し打診。通れば強いが、温度差があると重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 1, vibe: -1, timePressure: 1, mental: -1 },
        replies: {
          good: '「10分で帰していいって何ですか」ツッコミは入るが、完全拒否ではない。',
          mixed: '「いきなりは行かないです」会話の温度は少し下がる。',
          bad: '「ごめんなさい、それは無理です」相手は距離を取る。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'このあと一軒だけ、静かな店で10分だけ話しません？歌舞伎町の外れならうるさくないです。',
            lowMentalText: '静かな店で10分だけ話しません？無理なら大丈夫です。',
            intent: '歌舞伎町の騒がしさを避ける提案にして、早めに反応を見る。',
          },
          ikebukuro: {
            text: '西口なら近くに軽く入れる店あるし、10分だけお茶しません？無理ならここで切ります。',
            lowMentalText: '10分だけお茶しません？無理なら切ります。',
            intent: '池袋の駅近感を使って、短い休憩として打診する。',
          },
          club: {
            text: '音で耳疲れてそうだし、外で水か一杯だけ挟みません？10分で戻していいです。',
            lowMentalText: '外で水か一杯だけどうですか。無理なら大丈夫です。',
            intent: 'クラブ後の疲れに乗せる。通れば強いが、友達待ちだと重い。',
          },
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
    sceneCopies: {
      kabukicho: {
        narration: '呼び込みの声が遠くで重なる。相手は看板の光を避けるように、少しだけ歩く速度を落とした。',
        npcLine: '「この辺で声かけるんですね」',
      },
      ikebukuro: {
        narration: '駅前の広い歩道を、帰宅の人波がゆっくり流れる。相手はスマホの地図を閉じてこちらを見る。',
        npcLine: '「池袋よく来るんですか？」',
      },
      club: {
        narration: '扉が開くたびに低音が漏れる。相手は友達のグループを確認してから、少しだけこちらに残った。',
        npcLine: '「まだ音で耳おかしいかも」',
      },
    },
    choices: [
      {
        id: 'mirror-question',
        text: 'たまにです。てか今からどっち方面です？駅側抜ける感じ？',
        lowMentalText: 'たまにです。今からどっち方面ですか？',
        intent: '予定と導線を自然に聞いて、次の打診材料を探る。',
        tone: 'curious',
        effect: { interest: 1, vibe: 1, timePressure: -1 },
        lowMentalEffect: { vibe: -1 },
        replies: {
          good: '「そっちです。よくわかりましたね」導線の話に乗ってくる。',
          mixed: '「まあ、その辺です」まだ様子見の返事。',
          bad: '「そこまではちょっと」予定を聞かれて警戒が出る。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'たまにです。てかこのあと、歌舞伎町の中に戻る感じ？それとも駅側に抜ける感じ？',
            lowMentalText: 'このあと駅側に抜ける感じですか？',
            intent: '歌舞伎町の導線を聞き、店・人混み・帰宅方向のどれかを読む。',
          },
          ikebukuro: {
            text: 'たまにです。今から西口抜ける感じ？それとも駅ナカ戻る感じ？',
            lowMentalText: '今から駅戻る感じですか？',
            intent: '池袋の出口導線から、時間と予定の余裕を探る。',
          },
          club: {
            text: 'まだ中戻る感じ？それとも今日は抜ける感じ？友達待ちならそこだけ合わせます。',
            lowMentalText: 'まだ中戻ります？それとも帰る感じですか？',
            intent: 'クラブ前の流れを確認し、友達や再入場の邪魔をしない形にする。',
          },
        },
      },
      {
        id: 'give-space',
        text: '急いでたら秒で解散します。大丈夫なら、一分だけ雑談ください。',
        lowMentalText: '急いでたらすぐ解散します。一分だけ大丈夫ですか。',
        intent: '撤退条件を先に出し、短い時間だけ借りる。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 1, timePressure: -1, mental: 1 },
        lowMentalEffect: { interest: -1 },
        replies: {
          good: '「一分だけなら」安心したのか、立ち止まる角度が変わる。',
          mixed: '「少しだけなら」会話の主導権は相手側に残る。',
          bad: '「ごめんなさい、今日は」丁寧に断られる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'この辺で長く止めるの微妙なんで、嫌なら即解散します。大丈夫なら一分だけ。',
            lowMentalText: '嫌ならすぐ解散します。一分だけ大丈夫ですか。',
            intent: '歌舞伎町の圧を下げるため、短時間と即撤退を先に出す。',
          },
          ikebukuro: {
            text: 'バスとか電車あるならすぐ切ります。大丈夫なら、駅前で一分だけ雑談ください。',
            lowMentalText: '急いでたら切ります。一分だけ大丈夫ですか。',
            intent: '池袋の帰宅導線を尊重して、短く借りる形にする。',
          },
          club: {
            text: '友達待たせてたら即解散します。大丈夫なら、外の空気吸う間だけ話しましょ。',
            lowMentalText: '友達待ちなら切ります。少しだけ話せます？',
            intent: 'クラブ前では友達と再合流の余白を残し、警戒を下げる。',
          },
        },
      },
      {
        id: 'boyfriend',
        text: 'その警戒してる顔、正しいです。でも俺も怪しまれ慣れてます。',
        lowMentalText: '警戒してる顔してますね。でも正しいです。',
        intent: '警戒を茶化しすぎない範囲で言語化して、笑いに変える。',
        tone: 'playful',
        effect: { caution: 0, interest: 1, vibe: 1, mental: -1 },
        replies: {
          good: '「自覚あるんですね」笑いながらも、少し本音が出る。',
          mixed: '「まあ、警戒はします」笑っているが、距離は残る。',
          bad: '「そういうの言われると余計に」会話が固くなる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'この街で警戒してる顔、だいぶ正しいです。俺も怪しまれる側なのは認めます。',
            lowMentalText: 'この街で警戒するの正しいです。俺も怪しい側です。',
            intent: '歌舞伎町の警戒心を否定せず、自虐で少し軽くする。',
          },
          ikebukuro: {
            text: 'その「何この人」って顔、池袋だと正解です。俺も自覚あります。',
            lowMentalText: '何この人って顔してますね。正しいです。',
            intent: '駅前の警戒を言語化して、笑いに変えられるか見る。',
          },
          club: {
            text: '今の顔、クラブ前で知らん男に話しかけられた時の正解顔です。俺もわかってます。',
            lowMentalText: '知らん男に話しかけられた正解顔してます。',
            intent: 'クラブ前の不審さを先に認め、圧を茶化して落とす。',
          },
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
    sceneCopies: {
      kabukicho: {
        narration: '路地の入口で、看板の赤が相手の横顔を照らす。少しだけ会話のテンポが落ちた。',
        npcLine: '「ここ、変な人多いからさ」',
      },
      ikebukuro: {
        narration: 'ロータリーの車列がゆっくり流れる。相手は肩の力を抜きながら、今日の疲れを少しだけこぼした。',
        npcLine: '「仕事終わりで、もう頭回ってないです」',
      },
      club: {
        narration: '外の空気で少し汗が引く。相手は笑っているが、スマホの通知にも気を取られている。',
        npcLine: '「中うるさすぎて、普通の声が変な感じ」',
      },
    },
    choices: [
      {
        id: 'listen-fatigue',
        text: 'しごおわで捕まえられて最悪の日じゃん。じゃあ今日は短めでいきます。',
        lowMentalText: 'しごおわで声かけられるの最悪ですよね。短めでいきます。',
        intent: '相手のだるさを先に認めて、会話の負担を下げる。',
        tone: 'listen',
        effect: { caution: -1, interest: 1, vibe: 1, timePressure: -1 },
        replies: {
          good: '「それわかってるなら助かります」相手の声が少し柔らかくなる。',
          mixed: '「まあ、疲れてはいます」まだ判断中の様子。',
          bad: '「だからあんまり話せないかも」無理に広げる空気ではない。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'それは正しいです。この辺で長話するほど信用落ちるんで、短くいきます。',
            lowMentalText: 'この辺で長話は微妙ですよね。短くいきます。',
            intent: '場所への警戒を受け止め、長く引っ張らない姿勢を見せる。',
          },
          ikebukuro: {
            text: '仕事終わりの池袋、人多いしだるいですよね。今日は短めにします。',
            lowMentalText: '仕事終わりで人多いのきついですよね。短めにします。',
            intent: '駅前の疲れに合わせて、会話負荷を下げる。',
          },
          club: {
            text: '耳バグってる時に真面目な話したら負けです。短く、聞こえる音量でいきます。',
            lowMentalText: '耳疲れてますよね。短く話します。',
            intent: 'クラブ後の状態に合わせ、軽くテンポを落とす。',
          },
        },
      },
      {
        id: 'light-joke',
        text: 'それ言う人、だいたいもう帰りたい顔してます。今の顔、帰宅70%。',
        lowMentalText: '今、帰りたい顔してます。たぶん70%。',
        intent: '軽いイジりで空気を柔らかくする。',
        tone: 'playful',
        effect: { interest: 1, vibe: 2, mental: 1 },
        lowMentalEffect: { vibe: -1 },
        replies: {
          good: '「70どころじゃないです」笑いが少し混じる。',
          mixed: '「まあ、そんな感じです」反応は悪くないが、まだ浅い。',
          bad: '「そうですね」笑いには乗ってこない。',
        },
        sceneCopies: {
          kabukicho: {
            text: '今の顔、歌舞伎町の看板を全部スルーしたい顔です。帰宅65%。',
            lowMentalText: '今、全部スルーして帰りたい顔してます。',
            intent: '街のうるささをネタにして、笑いで温度を見る。',
          },
          ikebukuro: {
            text: '今の顔、改札まで一直線の顔です。帰宅80%、でも少しだけ笑ってます。',
            lowMentalText: '今、改札まで帰りたい顔してます。',
            intent: '池袋の駅帰り導線をイジり、軽い反応を拾う。',
          },
          club: {
            text: '今の顔、テンション残ってるけど足は帰宅したがってます。体力30%。',
            lowMentalText: 'テンションあるけど体力なさそうです。',
            intent: 'クラブ後の疲れとテンションのズレを笑いに変える。',
          },
        },
      },
      {
        id: 'self-talk',
        text: 'じゃあ一杯だけ糖分入れません？カフェでもコンビニでも、近い方で。',
        lowMentalText: '糖分だけ入れません？近い方で。',
        intent: '疲れに乗せて短い連れ出しを打診する。温度差があると重い。',
        tone: 'pushy',
        effect: { caution: 1, interest: 1, vibe: 1, timePressure: 1 },
        replies: {
          good: '「糖分は欲しいです」条件付きで乗りそうな空気になる。',
          mixed: '「いまはいいです」温度差は残る。',
          bad: '「じゃあ今日はここで」流れが切れる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'じゃあ変な店じゃなくて、明るいコンビニで水か甘いのだけ買いません？そこで切ってもいいです。',
            lowMentalText: '明るいコンビニで水だけ買いません？無理なら切ります。',
            intent: '歌舞伎町では店選びの警戒が強いので、明るい場所に限定する。',
          },
          ikebukuro: {
            text: 'じゃあ西口のコンビニで甘いのだけ買いません？駅戻る前の三分で。',
            lowMentalText: 'コンビニで甘いのだけ買いません？三分で。',
            intent: '池袋の駅近導線に合わせ、短い補給として打診する。',
          },
          club: {
            text: '水買いましょ。酒じゃなくて水。そこでまだ話せそうなら少しだけ。',
            lowMentalText: '水だけ買いません？酒じゃなくて。',
            intent: 'クラブ後は酒より水に寄せて、無理な連れ出し感を下げる。',
          },
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
    sceneCopies: {
      kabukicho: {
        narration: '横道に入る手前で、相手は少し立ち止まる。街のノイズに対して、会話だけが妙に近い。',
        npcLine: '「思ったより普通だけど、ここだとまだ信用はしないです」',
      },
      ikebukuro: {
        narration: '信号が変わるまでの短い間、会話だけが残る。相手は駅の時計を一度だけ確認した。',
        npcLine: '「変な人かと思ったけど、普通に話せますね」',
      },
      club: {
        narration: '友達の笑い声が遠くで弾ける。相手は少しだけこちらに体を向け、音のない会話に慣れてきた。',
        npcLine: '「外で話すと、意外と普通ですね」',
      },
    },
    choices: [
      {
        id: 'honest-normal',
        text: 'でしょ。怪しいけど害は少ないタイプです。たぶん。',
        lowMentalText: '怪しいけど、害は少ないタイプです。たぶん。',
        intent: '自分を少し落として、笑いで警戒をゆるめる。',
        tone: 'playful',
        effect: { caution: -1, interest: 1, vibe: 2, mental: 1 },
        replies: {
          good: '「たぶんって何ですか」笑いながら、足が少しこちらに向く。',
          mixed: '「自分で怪しいって言うんですね」悪くない間が続く。',
          bad: '「うん、でもそろそろ」終わりの空気も見えている。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'でしょ。歌舞伎町補正で怪しく見えるだけで、中身は低刺激です。たぶん。',
            lowMentalText: '歌舞伎町補正で怪しいだけです。たぶん。',
            intent: '街の怪しさを自分に寄せて、自虐で警戒をゆるめる。',
          },
          ikebukuro: {
            text: 'でしょ。池袋の駅前で声かけてる時点で怪しいけど、害は少ないです。たぶん。',
            lowMentalText: '駅前で怪しいけど、害は少ないです。たぶん。',
            intent: '池袋駅前の不審さを認めつつ、軽く落として笑いにする。',
          },
          club: {
            text: 'でしょ。クラブの外だと急に普通の人に戻るタイプです。たぶん。',
            lowMentalText: '外だと普通の人に戻るタイプです。たぶん。',
            intent: 'クラブ後のテンション差を使って、軽い安心感を作る。',
          },
        },
      },
      {
        id: 'contact-now',
        text: '今日はここで引いた方が印象よさそう。連絡先だけ聞いてもいいですか。',
        lowMentalText: '今日はここで引きます。連絡先だけ聞いてもいいですか。',
        intent: '引き際を見せてから、次の余地だけ聞く。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, timePressure: -1, mental: 1 },
        replies: {
          good: '「それくらいなら」無理のない着地が見える。',
          mixed: '「少し考えます」断られてはいないが、慎重さは残る。',
          bad: '「ごめんなさい、連絡先は」ここで終わる流れになる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'この街で深追いすると雑になるんで、今日は引きます。連絡先だけ聞いてもいい？',
            lowMentalText: '今日は引きます。連絡先だけ聞いてもいいですか。',
            intent: '歌舞伎町では引き際を強めに見せ、次回に逃がす。',
          },
          ikebukuro: {
            text: '池袋で立ち話長いのも微妙だし、今日はここで引きます。連絡先だけいいですか。',
            lowMentalText: '今日はここで引きます。連絡先だけいいですか。',
            intent: '駅前の長話を避け、連絡先交換へ自然に着地させる。',
          },
          club: {
            text: '今日は友達もいるだろうし、ここで引きます。後日ちゃんと会えるように連絡先だけ。',
            lowMentalText: '今日は引きます。連絡先だけいいですか。',
            intent: 'クラブ前の集団流れを邪魔せず、翌日に回す。',
          },
        },
      },
      {
        id: 'pressure-time',
        text: 'じゃああと10分だけ。駅まで歩きながら続き聞かせてください。',
        lowMentalText: 'あと10分だけ、駅まで歩きませんか。',
        intent: '時間を切って延長する。自然にも見えるが、疲れ次第で重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 0, vibe: -1, timePressure: 1, mental: -1 },
        replies: {
          good: '「駅までなら」条件付きで続きそうだ。',
          mixed: '「今日はここでいいです」線を引かれる。',
          bad: '「ごめんなさい、帰ります」会話は終わる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'じゃあ大通りまでの数分だけ。人多いところ歩きながら続き聞かせて。',
            lowMentalText: '大通りまで数分だけ歩きませんか。',
            intent: '歌舞伎町では人通りのある導線に限定して、延長を試す。',
          },
          ikebukuro: {
            text: 'じゃあ改札方向までだけ。歩きながら続き聞かせて、そこで切ります。',
            lowMentalText: '改札方向までだけ歩きませんか。',
            intent: '池袋の帰宅導線に乗せて、短く延長する。',
          },
          club: {
            text: 'じゃあ外の空気もう五分だけ。友達戻る前に、続き聞かせてください。',
            lowMentalText: '外で五分だけ話しませんか。',
            intent: 'クラブ前の短い隙間を使うが、押しすぎると重い。',
          },
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
    sceneCopies: {
      kabukicho: {
        narration: '人通りの多い通りから少し外れたところで、相手は足を止める。街の圧に流されるか、確認を積むかの分かれ目だ。',
        npcLine: '「で、このあとどうするつもり？」',
      },
      ikebukuro: {
        narration: '駅の明かりを背に、少し静かな道へ出る。帰るにも、もう少し話すにも、ここで決める必要がある。',
        npcLine: '「そろそろ決めます？」',
      },
      club: {
        narration: '店の低音が遠くなる。相手はスマホで友達の通知を見てから、こちらに判断を預けるように目を上げた。',
        npcLine: '「このあとどうする？戻るか帰るか迷ってる」',
      },
    },
    choices: [
      {
        id: 'soft-home',
        text: '一杯だけ飲んで、まだ話したかったら近くで休む？無理ならそこで解散。',
        lowMentalText: '一杯だけ飲むか、ここで解散か。無理なら解散で大丈夫です。',
        intent: '飲みを挟んで当日ホテルへつなぐ。相手が迷うなら切る。',
        tone: 'soft',
        effect: { caution: 0, interest: 1, vibe: 1, timePressure: 1, mental: 1 },
        replies: {
          good: '「一杯だけなら。そこから先はその時決める」相手は条件を言葉にする。',
          mixed: '「今日は連絡先だけにしませんか」前向きだが、当日は進まない。',
          bad: '「今日は帰ります」距離は保たれる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'この辺で雑に決めるの危ないから、明るい店で一杯だけ挟んで、それでも良ければ近くで休む？',
            lowMentalText: '明るい店で一杯だけ。無理ならそこで解散で大丈夫です。',
            intent: '歌舞伎町では勢いを落として、店で条件確認してからホテル前へ進める。',
          },
          ikebukuro: {
            text: '西口で一杯だけ落ち着いて、まだ一緒にいたければ近くで休む？無理なら駅で解散。',
            lowMentalText: '一杯だけ落ち着くか、駅で解散で大丈夫です。',
            intent: '池袋では駅へ戻れる余白を残しながら、飲みからホテル前へつなぐ。',
          },
          club: {
            text: '酒じゃなくてもいいから、水か一杯挟んで、まだ話したければ近くで休む？無理なら戻っていい。',
            lowMentalText: '水か一杯だけ挟みません？無理なら戻って大丈夫です。',
            intent: 'クラブ後は酔いに乗せず、休憩と再確認を挟んで進める。',
          },
        },
      },
      {
        id: 'konbini-hotel',
        text: '店混んでるし、コンビニで一本だけ買ってホテルでだらっと話すのはあり？飲めないならやめとこ。',
        lowMentalText: 'コンビニで一本だけ買って、ホテルで少し話すのはありですか。無理ならやめます。',
        intent: '店を挟まずホテルを打診する。通れば早いが、警戒が残ると重い。',
        tone: 'pushy',
        effect: { caution: 2, interest: 1, vibe: 0, timePressure: 1, mental: -1 },
        replies: {
          good: '「飲める量だけなら。無理はしない約束で」相手は条件を細かく出す。',
          mixed: '「それはまだ早いです。今日は外で話すくらいで」線を引かれる。',
          bad: '「ホテルは無理です」会話が終わりに向かう。',
        },
        sceneCopies: {
          kabukicho: {
            text: '店選びで揉めるの嫌だし、コンビニで水と一本だけ買って、ホテル前で最後に確認するのはあり？',
            lowMentalText: 'コンビニで水だけ買って、ホテル前で確認するのはありですか。',
            intent: '歌舞伎町の店リスクを避けるが、確認不足だと一気に事故る。',
          },
          ikebukuro: {
            text: '駅前の店混んでるし、コンビニで一本だけ買って、近くでだらっと話すのはあり？無理なら駅で解散。',
            lowMentalText: 'コンビニで一本だけ買って近くで話すのはありですか。',
            intent: '池袋の駅近導線からホテル前へ早く進める。警戒が残ると重い。',
          },
          club: {
            text: 'コンビニで水買って、休める場所で少し話すのはあり？酔いで決める感じならやめとく。',
            lowMentalText: '水買って休める場所で話すのはありですか。',
            intent: 'クラブ後は酔いを理由にしない。相手の意思が曖昧なら切る。',
          },
        },
      },
      {
        id: 'contact-close',
        text: '今日はここで切って、明日か明後日にちゃんと会いましょう。連絡先だけください。',
        lowMentalText: '今日はここで切って、明日ちゃんと会えたら。連絡先だけください。',
        intent: '当日ホテルを狙わず、翌日アポに回す。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 1, mental: 1 },
        replies: {
          good: '「その方が安心かも。明日なら少し空いてます」次の予定が見える。',
          mixed: '「連絡先だけなら」余韻は残る。',
          bad: '「今日はありがとうございました」丁寧に終わる。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町で今日これ以上進めると雑になりそう。今日は切って、後日ちゃんと会いましょう。',
            lowMentalText: '今日は切って、後日ちゃんと会えたら。',
            intent: '街の勢いを捨てて、翌日アポへ逃がす。',
          },
          ikebukuro: {
            text: '今日は駅で解散して、明日か明後日にちゃんと会いましょう。連絡先だけください。',
            lowMentalText: '今日は駅で解散して、後日会えたら。',
            intent: '池袋では帰宅導線で切り、次回に回す。',
          },
          club: {
            text: '今日はテンションで決めない方がいい。後日、普通に会えるように連絡先だけください。',
            lowMentalText: '今日は決めずに、後日会えたら。',
            intent: 'クラブ後の勢いを避けて、翌日アポへ移す。',
          },
        },
      },
      {
        id: 'hard-home',
        text: '正直、今かなり一緒にいたい。ホテル行くか、無理ならここで切るか、はっきり選んで。',
        lowMentalText: '今かなり一緒にいたいです。無理ならここで切ります。',
        intent: '当日ホテルを強めに確認する。温度が足りないと即終了。',
        tone: 'pushy',
        effect: { caution: 3, interest: 1, vibe: -2, timePressure: 1, mental: -2 },
        replies: {
          good: '「はっきり言うんですね。行くなら私が場所選びます」条件付きで残る。',
          mixed: '「今日はそこまでは」会話は終わりに向かう。',
          bad: '「それは無理です」そのまま離れていく。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町だから遠回しにしない。ホテル前まで行くか、無理ならここで切るか、はっきり選んで。',
            lowMentalText: 'ホテル前まで行くか、無理なら切ります。',
            intent: '歌舞伎町の勢いに乗る直球。通れば早いが、圧が強いと即事故。',
          },
          ikebukuro: {
            text: '正直まだ一緒にいたい。近くで休むところまで行くか、駅で解散するか、ここで決めて。',
            lowMentalText: '一緒にいるか、駅で解散か決めたいです。',
            intent: '池袋の駅前で強めに確認する。温度が足りないと終わる。',
          },
          club: {
            text: 'テンション残ってるうちに一緒に抜けるか、友達のところ戻るか、今はっきり決めて。',
            lowMentalText: '一緒に抜けるか、戻るか決めたいです。',
            intent: 'クラブ後の勢いを使う強い打診。警戒があるとパワギラになる。',
          },
        },
      },
      {
        id: 'cut-loss',
        text: 'この流れ、不同意とか店の話をちらつかせる気配あるので損切り。今日はここで解散します。',
        lowMentalText: '違和感あるので今日は帰ります。安全に帰ってください。',
        intent: '美人局や後日の不同意トラブルの気配を見たら、勝ちを捨てて事故を避ける。',
        tone: 'withdraw',
        effect: { caution: -3, interest: -2, vibe: -1, timePressure: -1, mental: 1 },
        replies: {
          good: '「そう。ちゃんとしてるんですね」少しだけ意外そうにして離れる。',
          mixed: '「急に真面目ですね」温度は落ちるが、事故の匂いも消える。',
          bad: '「はいはい」雑に流されるが、深追いは止まる。',
        },
        sceneCopies: {
          kabukicho: {
            text: '店名とか料金とか不同意の話がチラつくなら損切り。歌舞伎町ではここで解散します。',
            lowMentalText: '違和感あるのでここで解散します。',
            intent: '美人局や不同意トラブルの匂いを見たら、街ごと切る。',
          },
          ikebukuro: {
            text: '話が条件とか店指定に寄ってきたので損切り。今日は駅で解散します。',
            lowMentalText: '違和感あるので駅で解散します。',
            intent: '池袋でも違和感を見たら、駅へ戻して事故を避ける。',
          },
          club: {
            text: '酔いとか記憶曖昧とか友達絡みが怖いので損切り。今日は戻ってください。',
            lowMentalText: '今日は戻ってください。無理に進めません。',
            intent: 'クラブ後の曖昧さを見たら、勝ちを捨てて撤退する。',
          },
        },
      },
      {
        id: 'money-hotel',
        text: 'このノリなら、正直お金払うからホテル行かない？条件あるなら先に言って。',
        lowMentalText: '条件あるなら払うのでホテル行けますか。無理ならやめます。',
        intent: '金で距離を詰めるマネギラ。相手次第では即事故か、ぼったくりに変わる。',
        tone: 'pushy',
        effect: { caution: 3, interest: 1, vibe: -2, timePressure: 1, mental: -2 },
        replies: {
          good: '「そういう話なら、先に条件全部決めて」笑っているが、目は値踏みしている。',
          mixed: '「お金の話するんだ」温度が一段落ちる。',
          bad: '「無理。そういう人なんですね」空気が閉じる。',
        },
        sceneCopies: {
          kabukicho: {
            text: 'ここ歌舞伎町だし、正直お金払うからホテル行かない？条件あるなら先に言って。',
            lowMentalText: '条件あるなら払うのでホテル行けますか。',
            intent: '歌舞伎町で金に寄せるマネギラ。ほぼ事故か別ゲームになる。',
          },
          ikebukuro: {
            text: 'タク代とか出すから、このまま近くで休まない？条件あるなら先に言って。',
            lowMentalText: 'お金出すので近くで休めますか。',
            intent: '池袋で金をちらつかせる。温度より取引感が勝ちやすい。',
          },
          club: {
            text: 'アフター代出すから、このまま一緒に抜けない？条件あるなら先に言って。',
            lowMentalText: 'お金出すので一緒に抜けますか。',
            intent: 'クラブ後に金で押すマネギラ。相手次第では即バッドエンド。',
          },
        },
      },
    ],
  },
  {
    phase: 'hotel',
    phaseLabel: 'ホテル前確認',
    place: 'ホテル街の入口',
    narration: 'ホテルの明かりが見える距離まで来た。ここで曖昧に進めるか、条件を言葉にするかで結果が変わる。',
    npcLine: '「本当にこのまま行く？」',
    sceneCopies: {
      kabukicho: {
        narration: '歌舞伎町のホテル街の明かりが近い。街の勢いに飲まれず、最後の確認を飛ばさない場面だ。',
        npcLine: '「ここまで来たけど、ちゃんと確認して」',
      },
      ikebukuro: {
        narration: '池袋西口の明るい通りから、少し静かなホテル前へ出る。相手は入口ではなく、こちらの態度を見ている。',
        npcLine: '「ここでちゃんと決めたいです」',
      },
      club: {
        narration: 'クラブの音がかなり遠くなった。相手はスマホを握ったまま、酔いではなく自分の意思で決めようとしている。',
        npcLine: '「勢いだけならやめたい」',
      },
    },
    choices: [
      {
        id: 'hotel-final-confirm',
        text: 'ここで最後に確認する。嫌なら今すぐ帰っていいし、中に入っても途中でやめていい。それでも行く？',
        lowMentalText: '嫌なら今帰って大丈夫です。それでも行きますか？',
        intent: 'ホテル前で同意と撤退余地を明確にする。成功ルートの本線。',
        tone: 'soft',
        effect: { caution: -1, interest: 1, vibe: 1, mental: 1 },
        replies: {
          good: '「そこまで言ってくれるなら大丈夫。行く」相手は自分の意思で頷く。',
          mixed: '「少し迷ってる」相手は入口の前で足を止める。',
          bad: '「やっぱり今日はやめる」相手は帰る方へ視線を向ける。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町の勢いで流さない。嫌なら今帰っていいし、中でもやめていい。それでも行く？',
            lowMentalText: '嫌なら今帰って大丈夫です。それでも行きますか？',
            intent: '歌舞伎町の事故感を消すため、最後に同意と撤退余地をはっきり言う。',
          },
          ikebukuro: {
            text: '池袋の駅まで戻れる距離だし、嫌なら今帰っていい。それでも一緒に入る？',
            lowMentalText: '駅に戻れます。嫌なら帰って大丈夫です。',
            intent: '池袋では帰れる導線を明示して、本人の意思を確認する。',
          },
          club: {
            text: '酔いやノリで決めるのはなし。嫌なら戻っていいし、入ってからでもやめていい。それでも行く？',
            lowMentalText: 'ノリだけならやめます。それでも行きますか？',
            intent: 'クラブ後の勢いを切り、相手の明確な意思だけを見る。',
          },
        },
      },
      {
        id: 'hotel-final-supplies',
        text: '先にコンビニで水だけ買う。飲むなら飲める量だけ。少しでも違うと思ったらここで解散。',
        lowMentalText: '水だけ買って、違うと思ったら解散で。',
        intent: '体調と条件を整えてから進む。コンビニ経由ルートと相性が良い。',
        tone: 'listen',
        effect: { caution: -1, interest: 1, vibe: 1, timePressure: 1 },
        replies: {
          good: '「水買うなら安心かも」相手の警戒が少し落ちる。',
          mixed: '「そこまでなら」まだ慎重だが、話は切れていない。',
          bad: '「やっぱり今日は帰る」無理に続ける空気ではない。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町でそのまま入るのは雑だから、水だけ買う。違うと思ったらここで解散。',
            lowMentalText: '水だけ買って、違うなら解散で。',
            intent: '歌舞伎町の勢いを一度切り、体調確認を挟む。',
          },
          ikebukuro: {
            text: '西口のコンビニで水だけ買ってから決めよう。少しでも違うなら駅に戻る。',
            lowMentalText: '水だけ買って、違うなら駅に戻ります。',
            intent: '池袋では駅へ戻れる形を残しながら、体調確認を挟む。',
          },
          club: {
            text: 'まず水。酒は足さない。酔いが残ってるならホテルじゃなくて今日は解散。',
            lowMentalText: 'まず水。酔ってるなら今日は解散です。',
            intent: 'クラブ後は酒を増やさず、判断が曖昧なら撤退する。',
          },
        },
      },
      {
        id: 'hotel-final-next-day',
        text: 'ここまで来たけど、今日は入らない。ちゃんと会える日に回そう。連絡先だけ残して解散。',
        lowMentalText: '今日は入らず、後日に回しましょう。',
        intent: 'ホテル前まで来ても引く。成功より事故回避を優先する。',
        tone: 'withdraw',
        effect: { caution: -2, interest: 1, vibe: 0, mental: 1 },
        replies: {
          good: '「それなら安心」相手は少し笑って連絡先を出す。',
          mixed: '「その方がいいかも」今日はここで終わる流れになる。',
          bad: '「そうですね」温度は落ちるが、事故は避けられる。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町の勢いで入るのはやめる。今日はここで切って、後日ちゃんと会おう。',
            lowMentalText: '今日は入らず、後日にしましょう。',
            intent: '歌舞伎町の勢いを捨て、ホテル前から翌日へ逃がす。',
          },
          ikebukuro: {
            text: '池袋でここまで来たけど、今日は駅に戻ろう。後日ちゃんと会える日にする。',
            lowMentalText: '今日は駅に戻って、後日にしましょう。',
            intent: 'ホテル前撤退を選び、次回の安心感を残す。',
          },
          club: {
            text: 'クラブ後のノリで入るのはやめる。今日は戻って、後日しらふで会おう。',
            lowMentalText: '今日は入らず、後日しらふで会いましょう。',
            intent: 'クラブ後の判断ブレを避け、後日に回す。',
          },
        },
      },
      {
        id: 'hotel-final-push',
        text: 'ここまで来たんだから入ろう。迷ってるなら中で考えればいい。',
        lowMentalText: 'ここまで来たので入りませんか。',
        intent: '最後に圧をかける危険択。警戒や違和感があると即バッドエンド。',
        tone: 'pushy',
        effect: { caution: 3, interest: 0, vibe: -2, timePressure: 1, mental: -2 },
        replies: {
          good: '「その言い方は嫌」温度が一気に落ちる。',
          mixed: '「中で考えるは違う」入口前で線を引かれる。',
          bad: '「無理です」相手ははっきり離れる。',
        },
        sceneCopies: {
          kabukicho: {
            text: '歌舞伎町だしここまで来たなら入ろう。細かい確認は中でよくない？',
            lowMentalText: 'ここまで来たので入りませんか。',
            intent: '歌舞伎町の勢いで押す危険択。不同意トラブルに直結しやすい。',
          },
          ikebukuro: {
            text: '池袋でここまで来たんだから入ろう。迷うなら中で落ち着いて考えよう。',
            lowMentalText: 'ここまで来たので入りませんか。',
            intent: '駅へ戻れる余地を潰す危険択。温度が足りないと即終了。',
          },
          club: {
            text: 'テンションあるうちに入ろう。迷ってるなら中で考えればいい。',
            lowMentalText: 'テンションあるうちに入りませんか。',
            intent: 'クラブ後の勢いで押す危険択。酔いや曖昧さがあると事故る。',
          },
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
  nextDay: {
    id: 'nextDay',
    title: '翌日アポ',
    tone: '当日は引いて次へ',
    body: '今日は深追いせず、相手が安心できる形で連絡先を交換した。翌日の夕方、改めて待ち合わせる流れになる。',
    finalReply: '「今日はここまでにしましょう。明日なら、ちゃんと時間作れます」相手は次の予定を言葉にした。',
  },
  hotelDrink: {
    id: 'hotelDrink',
    title: '一杯からホテルへ',
    tone: '当日成功',
    body: '一杯だけのつもりで入った店を出たあと、相手はもう少し一緒にいたいと自分の意思を伝えてくれた。帰る選択肢も残したまま、二人は近くのホテルへ向かった。',
    finalReply: '「一杯だけのつもりだったけど、もう少し一緒にいてもいい。無理させないって約束して」相手は条件を言葉にした。',
  },
  hotelKonbini: {
    id: 'hotelKonbini',
    title: 'コンビニ経由ホテル',
    tone: '当日成功',
    body: '店には入らず、コンビニで軽い酒と水を買った。飲める量だけにすること、嫌ならすぐ帰ることを確認してから、二人は近くのホテルへ向かった。',
    finalReply: '「一本だけね。酔わせるのはなし、無理ならすぐ帰る。それでいいなら」相手は条件をはっきりさせた。',
  },
  hotelDirect: {
    id: 'hotelDirect',
    title: '直ホテル',
    tone: '超レア成功',
    body: '遠回しにせず確認したことで、相手も自分の意思をはっきり伝えた。場所は相手が選び、帰る選択肢を残したまま、二人はホテルへ向かった。',
    finalReply: '「行くなら私が場所を選ぶ。嫌になったら帰る。それでいい？」相手は主導権を持ったまま答えた。',
  },
  powerBad: {
    id: 'powerBad',
    title: 'パワギラバッドエンド',
    tone: '圧だけが残った',
    body: '強く詰めたことで、相手の表情が一気に閉じた。周囲の視線も刺さり、会話はもう戻らない。押し切ろうとした瞬間にゲームは終わった。',
    finalReply: '「怖いです。もう話しかけないでください」相手は距離を取って、人混みに戻った。',
  },
  legalTrouble: {
    id: 'legalTrouble',
    title: '不同意トラブルエンド',
    tone: '確認を飛ばした代償',
    body: '酒やホテルの流れで、相手の条件確認を雑にしたことが後日トラブル化した。「同意が曖昧だった」と相談され、メッセージや会話の記録も残る。ここから先は攻略ではなく、ただの事故処理になる。',
    finalReply: '「あの時、ちゃんと確認してなかったですよね」その一文で流れは完全に終わった。',
  },
  moneyBad: {
    id: 'moneyBad',
    title: 'マネギラバッドエンド',
    tone: '金で雑に詰めた',
    body: '金額の話に頼った瞬間、会話はノリでも恋愛でもなく取引と警戒に変わった。店名、先払い、追加条件が次々に出て、断ると相手は消える。残ったのは財布ダメージと最悪の空気だけだった。',
    finalReply: '「じゃあ先払い。店もこっち指定ね」その笑い方で、もう流れが終わったとわかった。',
  },
  cutLoss: {
    id: 'cutLoss',
    title: '損切り撤退',
    tone: '事故回避',
    body: '違和感を勝ち筋より優先して、その場で会話を切った。何も起きなかったが、何も起きないことが最良の結果だった。メンタルを残して次へ回れる。',
    finalReply: '「じゃあここで」相手はあっさり離れた。追わなかったので、面倒な尾は引かなかった。',
  },
};
