import { questions } from "@/data/questions";

/** 質問ページ数 */
export const TOTAL_PAGES = 3;

export function getTotalPages(): number {
  return TOTAL_PAGES;
}

export function getPageQuestionIndices(page: number): number[] {
  const perPage = Math.ceil(questions.length / TOTAL_PAGES);
  const start = page * perPage;
  const end = Math.min(start + perPage, questions.length);
  if (start >= questions.length) return [];
  return Array.from({ length: end - start }, (_, i) => start + i);
}

export function isPageComplete(
  page: number,
  answers: (number | undefined)[],
): boolean {
  return getPageQuestionIndices(page).every((i) => answers[i] !== undefined);
}
