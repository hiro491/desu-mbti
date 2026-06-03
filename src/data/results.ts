import type { DiagnosisType } from "@/types/diagnosis";

export interface TypeResult {
  type: DiagnosisType;
  animal: string;
  name: string;
  catchphrase: string;
  summary: string;
  traits: string;
  suitableEndOfLife: string;
  compatibleTypes: string;
  livingHint: string;
  /** キャラクター画像差し替え用（public/characters/FSIT.png 等） */
  imagePath: string;
}

export const results: Record<DiagnosisType, TypeResult> = {
  FSIT: {
    type: "FSIT",
    animal: "シマリス",
    name: "準備万端なシマリス",
    catchphrase: "不安だからこそ、一人で完璧に整える",
    summary:
      "死への不安を、綿密な準備と自己完結で乗り越えようとするタイプ。魂の存続を信じつつ、他者に頼らず跡を整えます。",
    traits:
      "遺言書・生前整理・デジタル遺品の整理に力を発揮。感情を内に秘め、計画的に動きます。",
    suitableEndOfLife: "遺言書作成・生前整理・デジタル遺品整理",
    compatibleTypes: "F-S-C-T（家族想いのビーバー）、A-S-I-T（森の賢者フクロウ）",
    livingHint:
      "完璧な準備にこだわりすぎず、信頼できる一人に月に一度、気持ちを言葉にしてみましょう。",
    imagePath: "/characters/FSIT.png",
  },
  FSIN: {
    type: "FSIN",
    animal: "黒ネコ",
    name: "さすらいの黒ネコ",
    catchphrase: "未知への不安を抱え、自由に漂う",
    summary:
      "消滅への恐れと魂の信念を抱きながら、誰にも縛られない生き方・終わり方を選びます。",
    traits: "形式にとらわれず、直感で旅する。準備は最小限、体験と自立を重視します。",
    suitableEndOfLife: "身元保証・散骨・自由なお別れ",
    compatibleTypes: "F-N-I-N（刹那のチーター）、A-S-I-N（風まかせの渡り鳥）",
    livingHint: "孤立しすぎないよう、一人の相談先だけは決めておくと安心です。",
    imagePath: "/characters/FSIN.png",
  },
  FSCT: {
    type: "FSCT",
    animal: "ビーバー",
    name: "家族想いのビーバー",
    catchphrase: "残される家族のために、ダムを築く",
    summary:
      "自分が消える不安より、家族を守るための準備に力を注ぐタイプ。霊的なつながりも大切にします。",
    traits: "家族信託・保険・連絡網を整え、絆と実務の両方を押さえます。",
    suitableEndOfLife: "家族信託・生命保険・エンディングノート",
    compatibleTypes: "F-S-I-T（準備万端なシマリス）、A-S-C-T（優しく見守るクジラ）",
    livingHint: "家族のためになりすぎず、自分の希望も一言で伝える練習を。",
    imagePath: "/characters/FSCT.png",
  },
  FSCN: {
    type: "FSCN",
    animal: "ウサギ",
    name: "寂しがりやのウサギ",
    catchphrase: "一人になるのが怖く、絆を求める",
    summary:
      "死への不安を、人とのつながりと今の楽しさで和らげようとするタイプ。",
    traits: "ワイワイした関係を好み、形式より気持ちを重視。生前葬や集いに向いています。",
    suitableEndOfLife: "AI仏壇・生前葬・お別れ会",
    compatibleTypes: "F-N-C-N（お祭り好きのイルカ）、A-S-C-N（陽気なラッコ）",
    livingHint: "寂しさを認めつつ、無理のない範囲で人と会うリズムを作りましょう。",
    imagePath: "/characters/FSCN.png",
  },
  FNIT: {
    type: "FNIT",
    animal: "オオカミ",
    name: "孤高のオオカミ",
    catchphrase: "無になる恐怖と戦い、美しく去る",
    summary:
      "消滅への恐れを、痕跡を残さない潔い終わり方で向き合うタイプ。",
    traits: "ミニマルな整理と直葬・デジタル消去など、無駄のない選択を好みます。",
    suitableEndOfLife: "デジタル遺品消去・直葬・ミニマリスト的整理",
    compatibleTypes: "A-N-I-T（静かなるハクチョウ）、F-S-I-T（準備万端なシマリス）",
    livingHint: "孤高になりすぎず、一人だけ「最期の希望」を共有しておきましょう。",
    imagePath: "/characters/FNIT.png",
  },
  FNIN: {
    type: "FNIN",
    animal: "チーター",
    name: "刹那のチーター",
    catchphrase: "「今」に全振りする",
    summary:
      "いつか無になる恐怖を、スリルと体験で乗り越えようとするタイプ。",
    traits: "準備より瞬間の充実。旅行や体験に投資し、執着を手放します。",
    suitableEndOfLife: "体験型旅行・思い出作り",
    compatibleTypes: "F-S-I-N（さすらいの黒ネコ）、A-N-I-N（マイペースなナマケモノ）",
    livingHint: "楽しさだけでなく、最低限の連絡先メモだけは残しておきましょう。",
    imagePath: "/characters/FNIN.png",
  },
  FNCT: {
    type: "FNCT",
    animal: "ミーアキャット",
    name: "働き者のミーアキャット",
    catchphrase: "消滅の恐怖に、功績で抗う",
    summary:
      "無になる不安を、社会や群れへの確かな残し方で乗り越えようとします。",
    traits: "自分史・事業承継・実績の記録に長け、関係性も大切にします。",
    suitableEndOfLife: "自分史・事業承継・レガシー設計",
    compatibleTypes: "A-N-C-T（頼れるゴリラ）、F-S-C-T（家族想いのビーバー）",
    livingHint: "成果だけでなく、「誰と共有したいか」も年に一度見直しましょう。",
    imagePath: "/characters/FNCT.png",
  },
  FNCN: {
    type: "FNCN",
    animal: "イルカ",
    name: "お祭り好きのイルカ",
    catchphrase: "仲間と今を全力で遊び尽くす",
    summary:
      "死の不安を、仲間との笑いと今の体験で覆い隠すように生きるタイプ。",
    traits: "自由な葬儀・お別れ会を好み、形式よりみんなで楽しむことを重視。",
    suitableEndOfLife: "自由な形式の葬儀・お別れ会",
    compatibleTypes: "F-S-C-N（寂しがりやのウサギ）、A-S-C-N（陽気なラッコ）",
    livingHint: "楽しさの裏の不安も、信頼できる仲間に一言だけ共有してみましょう。",
    imagePath: "/characters/FNCN.png",
  },
  ASIT: {
    type: "ASIT",
    animal: "フクロウ",
    name: "森の賢者フクロウ",
    catchphrase: "死は自然なサイクル、静かに整える",
    summary:
      "死を自然の摂理として受け入れ、一人で落ち着いた終わりの儀式を整えるタイプ。",
    traits: "エンディングノート・樹木葬など、静かで魂の続きを感じる選択を好みます。",
    suitableEndOfLife: "エンディングノート・樹木葬",
    compatibleTypes: "A-S-C-T（優しく見守るクジラ）、F-S-I-T（準備万端なシマリス）",
    livingHint: "静かに抱え込みすぎず、月に一度は誰かと死生観を語る時間を。",
    imagePath: "/characters/ASIT.png",
  },
  ASIN: {
    type: "ASIN",
    animal: "渡り鳥",
    name: "風まかせの渡り鳥",
    catchphrase: "執着なく、魂の赴くまま",
    summary:
      "死を受け入れ、準備にも執着せず、自由に生きるタイプ。",
    traits: "特別な準備はしないことも。宇宙葬や自然任せの終わり方に共感します。",
    suitableEndOfLife: "特別な準備はしない・宇宙葬",
    compatibleTypes: "F-S-I-N（さすらいの黒ネコ）、A-N-I-N（マイペースなナマケモノ）",
    livingHint: "自由さの中でも、連絡先だけは誰かに一つ伝えておきましょう。",
    imagePath: "/characters/ASIN.png",
  },
  ASCT: {
    type: "ASCT",
    animal: "クジラ",
    name: "優しく見守るクジラ",
    catchphrase: "大きな愛で、群れの海を整える",
    summary:
      "死を自然と受け止め、家族や仲間が安心できる場と手続きを整えるタイプ。",
    traits: "ACP・代々のお墓・家族での話し合いを大切にします。",
    suitableEndOfLife: "家族でのACP・代々のお墓",
    compatibleTypes: "A-S-C-N（陽気なラッコ）、F-S-C-T（家族想いのビーバー）",
    livingHint: "みんなのためになりすぎないよう、自分の希望も書面に残しましょう。",
    imagePath: "/characters/ASCT.png",
  },
  ASCN: {
    type: "ASCN",
    animal: "ラッコ",
    name: "陽気なラッコ",
    catchphrase: "死は新しい旅立ち、仲間と手を繋ぐ",
    summary:
      "死を穏やかに受け入れ、形式にとらわれず仲間と今を楽しむタイプ。",
    traits: "形見分けパーティやカジュアルなお別れに向いています。",
    suitableEndOfLife: "形見分けパーティ・カジュアルなお別れ",
    compatibleTypes: "F-S-C-N（寂しがりやのウサギ）、F-N-C-N（お祭り好きのイルカ）",
    livingHint: "楽しさの中でも、年に一度は「もしものとき」を軽く話し合いを。",
    imagePath: "/characters/ASCN.png",
  },
  ANIT: {
    type: "ANIT",
    animal: "ハクチョウ",
    name: "静かなるハクチョウ",
    catchphrase: "無に還ることを悟り、美しく去る",
    summary:
      "死後は無になると合理的に受け止め、無駄なく整えて去るタイプ。",
    traits: "ミニマリスト的整理・家族葬。個の完結を大切にします。",
    suitableEndOfLife: "ミニマリスト的整理・家族葬",
    compatibleTypes: "F-N-I-T（孤高のオオカミ）、A-N-I-N（マイペースなナマケモノ）",
    livingHint: "合理だけでなく、感謝の一文を残すと心が軽くなります。",
    imagePath: "/characters/ANIT.png",
  },
  ANIN: {
    type: "ANIN",
    animal: "ナマケモノ",
    name: "マイペースなナマケモノ",
    catchphrase: "あるがままに、あくせくしない",
    summary:
      "いつか消えゆく身だからこそ、準備にも焦らず自然体で生きるタイプ。",
    traits: "あえて何もしない・自然葬など、流れに身を任せます。",
    suitableEndOfLife: "あえて何もしない・自然葬",
    compatibleTypes: "A-S-I-N（風まかせの渡り鳥）、F-N-I-N（刹那のチーター）",
    livingHint: "何もしない選択も尊重しつつ、連絡先だけは残しておきましょう。",
    imagePath: "/characters/ANIN.png",
  },
  ANCT: {
    type: "ANCT",
    animal: "ゴリラ",
    name: "頼れるゴリラ",
    catchphrase: "仲間のために、確かな土台を築く",
    summary:
      "意識は消えても、残される仲間のためにルールと準備を整えるタイプ。",
    traits: "遺産分割・信託・組織的な終活に長けています。",
    suitableEndOfLife: "厳格な遺産分割協議・信託設計",
    compatibleTypes: "F-N-C-T（働き者のミーアキャット）、A-S-C-T（優しく見守るクジラ）",
    livingHint: "正解を一人で持たず、家族と役割分担しましょう。",
    imagePath: "/characters/ANCT.png",
  },
  ANCN: {
    type: "ANCN",
    animal: "クジャク",
    name: "華やかなクジャク",
    catchphrase: "記憶に強烈に焼き付きたい",
    summary:
      "死後は無に還るが、みんなの記憶に華やかに残りたいタイプ。",
    traits: "プロによる遺影・派手な生前葬など、体験と印象を重視します。",
    suitableEndOfLife: "プロによる遺影撮影・派手な生前葬",
    compatibleTypes: "F-N-C-N（お祭り好きのイルカ）、A-S-C-N（陽気なラッコ）",
    livingHint: "華やかさの裏で、本当の気持ちも一言だけ書き留めておきましょう。",
    imagePath: "/characters/ANCN.png",
  },
};

export function getResult(type: DiagnosisType): TypeResult {
  return results[type];
}
