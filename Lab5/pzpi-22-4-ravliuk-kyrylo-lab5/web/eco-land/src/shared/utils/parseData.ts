export function parseUtcDate(dateStr: string): string {
  const utcDate = new Date(dateStr.replace(" ", "T") + ":00Z");
  const userLocale = navigator.language || "en-US";

  return new Intl.DateTimeFormat(userLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(utcDate)
    .replace(/\//g, "/");
}
