import { extractEmail, isValidEmail } from "@/lib/email";
import type { ParsedSheet, Recipient } from "@/lib/types";

const EMAIL_HINTS = [
  "メールアドレス",
  "メール",
  "email",
  "e-mail",
  "mailaddress",
  "mail",
];

const COMPANY_HINTS = [
  "事業所名",
  "事業所",
  "会社名",
  "企業名",
  "法人名",
  "店舗名",
  "施設名",
  "屋号",
  "宛名",
  "名称",
  "会社",
  "company",
  "organization",
  "organisation",
];

function compact(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function findHeader(headers: string[], hints: string[]): string {
  const ranked = headers.map((header) => ({ header, key: compact(header) }));
  for (const hint of hints) {
    const exact = ranked.find((item) => item.key === compact(hint));
    if (exact) return exact.header;
  }
  for (const hint of hints) {
    const partial = ranked.find((item) => item.key.includes(compact(hint)));
    if (partial) return partial.header;
  }
  return "";
}

export function suggestColumns(sheet: ParsedSheet): { email: string; company: string } {
  let email = findHeader(sheet.headers, EMAIL_HINTS);
  let company = findHeader(sheet.headers, COMPANY_HINTS);

  if (!email) {
    let best = "";
    let bestCount = 0;
    for (const header of sheet.headers) {
      const count = sheet.rows.reduce((total, row) => {
        return total + (isValidEmail(extractEmail(row.values[header] ?? "")) ? 1 : 0);
      }, 0);
      if (count > bestCount) {
        best = header;
        bestCount = count;
      }
    }
    email = best;
  }

  if (!company || company === email) {
    company = sheet.headers.find((header) => header && header !== email) ?? "";
  }

  return { email, company };
}

export function buildRecipients(
  sheet: ParsedSheet,
  emailColumn: string,
  companyColumn: string,
  previous?: Recipient[],
): Recipient[] {
  const previousById = new Map(previous?.map((recipient) => [recipient.id, recipient]));
  const seen = new Set<string>();

  return sheet.rows.map((row) => {
    const rawEmail = emailColumn ? (row.values[emailColumn] ?? "") : "";
    const email = extractEmail(rawEmail);
    const company = companyColumn ? (row.values[companyColumn] ?? "").trim() : "";
    const dedupeKey = email.toLowerCase();

    let valid = true;
    let warning = "";
    if (!emailColumn) {
      valid = false;
      warning = "メールアドレスの列を選んでください";
    } else if (!email) {
      valid = false;
      warning = "メールアドレスが空です";
    } else if (!isValidEmail(email)) {
      valid = false;
      warning = "メールアドレスの形式が正しくありません";
    }

    const duplicate = valid && seen.has(dedupeKey);
    if (valid) seen.add(dedupeKey);
    if (duplicate) warning = "同じメールアドレスが上の行にあります";
    else if (valid && !company) warning = "事業所名が空です";

    const id = `${sheet.name}:${row.rowNumber}`;
    const prior = previousById.get(id);
    const fields = { ...row.values };
    if (emailColumn) fields[emailColumn] = email;
    fields["メールアドレス"] = email;
    if (!("メール" in row.values) || emailColumn === "メール") fields["メール"] = email;
    if (companyColumn) fields[companyColumn] = company;
    fields["事業所名"] = company;

    return {
      id,
      rowNumber: row.rowNumber,
      email,
      company,
      fields,
      valid,
      duplicate,
      warning,
      selected: prior ? prior.selected && valid : valid && !duplicate,
      status: "idle",
    };
  });
}
