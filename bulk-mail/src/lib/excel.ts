import ExcelJS from "exceljs";
import type { ParsedRow, ParsedSheet } from "@/lib/types";

const MAX_ROWS = 2000;
const MAX_COLS = 40;
const MAX_CELL = 5000;

function columnLetter(index: number): string {
  let n = index;
  let letters = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim().slice(0, MAX_CELL);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 1000) / 1000);
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "object") {
    if ("error" in value && value.error) return "";
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text ?? "")
        .join("")
        .trim()
        .slice(0, MAX_CELL);
    }
    if ("result" in value && value.result != null) {
      return cellToString(value.result as ExcelJS.CellValue);
    }
    if ("hyperlink" in value && typeof value.hyperlink === "string") {
      const link = value.hyperlink.replace(/^mailto:/i, "").trim();
      if (link.includes("@")) return link.slice(0, MAX_CELL);
      if ("text" in value && typeof value.text === "string" && value.text.trim()) {
        return value.text.trim().slice(0, MAX_CELL);
      }
      return link.slice(0, MAX_CELL);
    }
    if ("text" in value && typeof value.text === "string") {
      return value.text.trim().slice(0, MAX_CELL);
    }
  }
  return String(value).trim().slice(0, MAX_CELL);
}

function uniqueHeaders(raw: string[]): string[] {
  const seen = new Map<string, number>();
  return raw.map((header, index) => {
    const base = header.trim() || `列${columnLetter(index + 1)}`;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

function rowsFromMatrix(headers: string[], matrix: string[][], startRowNumber: number): ParsedRow[] {
  const rows: ParsedRow[] = [];
  for (let index = 0; index < matrix.length; index += 1) {
    if (rows.length >= MAX_ROWS) break;
    const source = matrix[index] ?? [];
    const values: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, column) => {
      const value = (source[column] ?? "").trim().slice(0, MAX_CELL);
      values[header] = value;
      if (value) hasValue = true;
    });
    if (!hasValue) continue;
    rows.push({ rowNumber: startRowNumber + index, values });
  }
  return rows;
}

export function parseCsvText(text: string, name = "CSV"): ParsedSheet[] {
  const source = text.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(source);
  const matrix = parseDelimited(source, delimiter).filter((row) => row.some((cell) => cell.trim()));
  if (matrix.length === 0) {
    throw new Error("CSVに行がありません。1行目を見出しにしてください。");
  }
  const width = Math.min(
    MAX_COLS,
    Math.max(...matrix.map((row) => row.length)),
  );
  const headers = uniqueHeaders(matrix[0].slice(0, width));
  const data = matrix.slice(1).map((row) => row.slice(0, width));
  return [
    {
      name,
      headers,
      rows: rowsFromMatrix(headers, data, 2),
      truncated: matrix.length - 1 > MAX_ROWS,
    },
  ];
}

function detectDelimiter(text: string): "," | "\t" | ";" {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = {
    ",": countChar(firstLine, ","),
    "\t": countChar(firstLine, "\t"),
    ";": countChar(firstLine, ";"),
  };
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) return "\t";
  if (counts[";"] > counts[","]) return ";";
  return ",";
}

function countChar(value: string, char: string): number {
  let count = 0;
  for (const item of value) if (item === char) count += 1;
  return count;
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function decodeCsv(buffer: Buffer): string {
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return buffer.subarray(3).toString("utf8");
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("shift_jis").decode(buffer);
  }
}

function sheetColumnCount(sheet: ExcelJS.Worksheet): number {
  let max = 0;
  const scanUntil = Math.min(sheet.rowCount, 30);
  for (let rowNumber = 1; rowNumber <= scanUntil; rowNumber += 1) {
    sheet.getRow(rowNumber).eachCell({ includeEmpty: false }, (_cell, column) => {
      if (column > max) max = column;
    });
  }
  return Math.min(MAX_COLS, max);
}

function readSheet(sheet: ExcelJS.Worksheet): ParsedSheet | null {
  const width = sheetColumnCount(sheet);
  if (width === 0) return null;
  const headerRow = sheet.getRow(1);
  const rawHeaders = Array.from({ length: width }, (_, index) =>
    cellToString(headerRow.getCell(index + 1).value),
  );
  if (rawHeaders.every((header) => !header)) return null;
  const headers = uniqueHeaders(rawHeaders);
  const matrix: string[][] = [];
  const lastRow = Math.min(sheet.rowCount, MAX_ROWS + 1);
  for (let rowNumber = 2; rowNumber <= lastRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    matrix.push(
      headers.map((_, index) => cellToString(row.getCell(index + 1).value)),
    );
  }
  return {
    name: sheet.name,
    headers,
    rows: rowsFromMatrix(headers, matrix, 2),
    truncated: sheet.rowCount > MAX_ROWS + 1,
  };
}

export async function parseWorkbook(buffer: Buffer): Promise<ParsedSheet[]> {
  const workbook = new ExcelJS.Workbook();
  try {
    // exceljs の型定義は Node.js の Buffer ではなく独自の Buffer を要求する。
      await workbook.xlsx.load(buffer as unknown as Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0]);
  } catch {
    throw new Error("Excelファイルを読み取れませんでした。.xlsx または CSV を指定してください。");
  }
  const sheets = workbook.worksheets
    .map((sheet) => readSheet(sheet))
    .filter((sheet): sheet is ParsedSheet => sheet !== null);
  if (sheets.length === 0) {
    throw new Error("表が見つかりませんでした。1行目を見出しにしてください。");
  }
  return sheets;
}

export function parseUpload(buffer: Buffer, filename: string): Promise<ParsedSheet[]> | ParsedSheet[] {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) {
    throw new Error("古い形式の .xls には対応していません。Excelで .xlsx として保存し直すか、CSVにしてください。");
  }
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
  if (isZip || filename.toLowerCase().endsWith(".xlsx")) {
    return parseWorkbook(buffer);
  }
  return parseCsvText(decodeCsv(buffer), filename.replace(/\.[^.]+$/, "") || "CSV");
}

export async function buildSampleWorkbook(): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "一斉メール";
  const sheet = workbook.addWorksheet("宛先");
  sheet.columns = [
    { header: "事業所名", key: "company", width: 32 },
    { header: "メールアドレス", key: "email", width: 34 },
    { header: "担当者名", key: "person", width: 16 },
  ];
  sheet.addRows([
    ["青葉ケアセンター", "aoaba@example.com", "佐藤"],
    ["みどり訪問看護ステーション", "midori@example.com", "鈴木"],
    ["ひだまり事業所", "hidamari@example.com", "高橋"],
  ]);
  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
