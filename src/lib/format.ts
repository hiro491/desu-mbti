export function formatDateRange(
  start: string | null,
  end: string | null
): string | null {
  if (!start && !end) return null;

  const fmt = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (start && end) return `${fmt(start)} 〜 ${fmt(end)}`;
  if (start) return `${fmt(start)} 〜`;
  return `〜 ${fmt(end!)}`;
}

export function formatEventDateRange(
  start: string | null,
  end: string | null,
  startTime?: string | null,
  endTime?: string | null
): string | null {
  if (!start && !end) return null;

  const fmt = (value: string, time?: string | null) => {
    const date = new Date(`${value}T00:00:00`);
    const datePart = `${date.getMonth() + 1}/${date.getDate()}`;
    const timePart = time?.trim() || "00:00";
    return `${datePart} ${timePart}`;
  };

  if (start && end) {
    return `${fmt(start, startTime)} 〜 ${fmt(end, endTime)}`;
  }
  if (start) return `${fmt(start, startTime)} 〜`;
  return `〜 ${fmt(end!, endTime)}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
