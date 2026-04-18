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

export type TargetRisk = 'powerRisk' | 'troubleRisk' | 'moneyRisk';

export type SceneVisualKey = 'shibuya' | 'kabukicho' | 'ikebukuro' | 'club';

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
      },
      {
        id: 'money-hotel',
        text: '歌舞伎町っぽいノリなら、正直お金払うからホテル行かない？条件あるなら先に言って。',
        lowMentalText: '条件あるなら払うのでホテル行けますか。無理ならやめます。',
        intent: '金で距離を詰めるマネギラ。相手次第では即事故か、ぼったくりに変わる。',
        tone: 'pushy',
        effect: { caution: 3, interest: 1, vibe: -2, timePressure: 1, mental: -2 },
        replies: {
          good: '「そういう話なら、先に条件全部決めて」笑っているが、目は値踏みしている。',
          mixed: '「お金の話するんだ」温度が一段落ちる。',
          bad: '「無理。そういう人なんですね」空気が閉じる。',
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
