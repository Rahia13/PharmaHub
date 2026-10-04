function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const timeFmt: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

/** "Today, 10:32 AM" or "Aug 1, 10:32 AM" */
export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", timeFmt);
  if (isToday(d)) return `Today, ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${time}`;
}

/** "Today, Aug 1, 2026" */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return isToday(d) ? `Today, ${date}` : date;
}
