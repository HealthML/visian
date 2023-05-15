/**
 * Converts a date to a string for either german or english format.
 * @param date The date to be converted.
 * @returns The date as a string in german format if the timezone is Europe/Berlin, otherwise in english format.
 */
export function getDisplayDate(date: Date): string {
  if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Europe/Berlin") {
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    hour12: true,
    minute: "2-digit",
  });
}
