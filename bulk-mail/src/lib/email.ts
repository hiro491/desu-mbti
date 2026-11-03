const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extractEmail(raw: string): string {
  const text = raw.trim();
  const angle = text.match(/<([^<>\s]+@[^<>\s]+)>/);
  const candidate = (angle?.[1] ?? text).replace(/^mailto:/i, "").trim();
  return candidate;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email) && email.length <= 254 && !email.includes("..");
}
