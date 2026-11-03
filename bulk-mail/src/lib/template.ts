const PLACEHOLDER = /\{\{\s*([^{}]+?)\s*\}\}/g;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function applyTemplate(
  template: string,
  fields: Record<string, string>,
  escapeValues: boolean,
): string {
  return template.replace(PLACEHOLDER, (match, raw: string) => {
    const key = raw.trim();
    if (!Object.prototype.hasOwnProperty.call(fields, key)) return match;
    const value = fields[key] ?? "";
    return escapeValues ? escapeHtml(value) : value;
  });
}

export function textToHtml(text: string): string {
  return escapeHtml(text).replaceAll("\n", "<br>\n");
}

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function placeholdersIn(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER)) {
    found.add(match[1]?.trim() ?? "");
  }
  found.delete("");
  return [...found];
}
