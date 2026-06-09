import { questions } from "@/data/questions";

/** 1〜4ページ目は10問、5ページ目（最終）のみ12問 */
export const QUESTIONS_PER_PAGE = 10;
export const LAST_PAGE_SIZE = 12;
export const TOTAL_PAGES = 5;

export function getTotalPages(): number {
  return TOTAL_PAGES;
}

export function getPageQuestionIndices(page: number): number[] {
  if (page < 0 || page >= TOTAL_PAGES) return [];

  const regularPages = TOTAL_PAGES - 1;
  const regularCount = regularPages * QUESTIONS_PER_PAGE;

  if (page < regularPages) {
    const start = page * QUESTIONS_PER_PAGE;
    const end = start + QUESTIONS_PER_PAGE;
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  const start = regularCount;
  const end = questions.length;
  return Array.from({ length: end - start }, (_, i) => start + i);
}

export function isPageComplete(
  page: number,
  answers: (number | undefined)[],
): boolean {
  return getPageQuestionIndices(page).every((i) => answers[i] !== undefined);
}
