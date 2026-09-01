export const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

export function inicjaly(imieNazwisko: string) {
  return imieNazwisko
    .replace(/^(prof\.|dr|hab\.)\s+/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("pl-PL");
}

export function formatFileSize(kilobytes: number) {
  if (kilobytes >= 1024) {
    return `${(kilobytes / 1024).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} MB`;
  }
  return `${kilobytes.toLocaleString("pl-PL")} KB`;
}
