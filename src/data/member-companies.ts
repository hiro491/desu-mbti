import type { DiagnosisType } from "@/types/diagnosis";

export interface MemberCompany {
  id: string;
  name: string;
  overview: string;
  /** `public/members/` 配下。未設定ならロゴ枠のみ表示する */
  logoPath?: string;
  /** 余白の多いロゴを枠内で少し大きく見せる */
  logoScale?: number;
  url?: string;
}

/**
 * 会員企業マスタ。
 * ロゴは `public/members/` に置き、logoPath を `/members/xxx.jpg` にする。
 */
export const memberCompanies: Record<string, MemberCompany> = {
  sousou: {
    id: "sousou",
    name: "株式会社そうそう",
    overview:
      "マイナンバーカードを使った本人確認とデジタル技術で終活・相続などの負担を減らすアプリを提供。",
    logoPath: "/members/sousou.jpg",
    logoScale: 1.55,
    url: "https://sousou-official.com/",
  },
  algordanza: {
    id: "algordanza",
    name: "有限会社アルゴダンザ・ジャパン",
    overview:
      "遺骨中に残存する炭素から合成ダイヤモンドを生成・提供。大切な人が美しいダイヤモンドに生まれ変わり、いつでもどこでも一緒に身に付けることができます。",
    logoPath: "/members/algordanza.png",
    url: "https://www.algordanza.co.jp/",
  },
  mamomiru: {
    id: "mamomiru",
    name: "マモミル（株式会社OTERA）",
    overview:
      "携帯の画面ON/OFFや加速度センサーなどを自動検知して、1日1回携帯を開くか・触ってもらえれば安否確認ができる無料見守りアプリです。緊急連絡ボタン等にも対応。",
    logoPath: "/members/mamomiru.jpg",
    url: "https://otera.co.jp/mamoruba/apps",
  },
};

/**
 * 診断タイプごとの表示企業。
 * 未記載、または空配列のタイプは「向いている終活」に会員企業を出さない。
 * 値は memberCompanies の id。
 */
export const memberCompaniesByType: Partial<Record<DiagnosisType, string[]>> = {
  FSIT: ["sousou"],
  FSIN: ["algordanza"],
  FNIT: ["sousou"],
  FNIN: ["sousou"],
  ASIT: ["algordanza"],
  ASIN: ["algordanza"],
  ASCN: ["algordanza"],
  ANIT: ["sousou"],
  ANIN: ["mamomiru"],
  ANCT: ["sousou"],
};

export function getMemberCompaniesForType(
  type: DiagnosisType,
): MemberCompany[] {
  const ids = memberCompaniesByType[type];
  if (!ids?.length) return [];

  return ids.flatMap((id) => {
    const company = memberCompanies[id];
    return company ? [company] : [];
  });
}
