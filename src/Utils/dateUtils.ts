// Date utility functions
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

/**
 * Format date to display string
 */
export const formatDate = (
  date: Date | string,
  format: string = "DD MMM YYYY"
): string => {
  return dayjs(date).format(format);
};

/**
 * Get start of week (Sunday)
 */
export const getStartOfWeek = (date: Date): Date => {
  const d = dayjs(date);
  const day = d.day();
  return d.subtract(day, "day").toDate();
};

/**
 * Get end of week (Saturday)
 */
export const getEndOfWeek = (date: Date): Date => {
  const d = dayjs(date);
  const day = d.day();
  return d.add(6 - day, "day").toDate();
};

/**
 * Get month label from date
 */
export const getMonthLabel = (date: Date | string): string => {
  return dayjs(date).format("MMM'YY");
};

/**
 * Get week label
 */
export const getWeekLabel = (weekNum: number): string => {
  return `Week ${weekNum}`;
};

/**
 * Parse date string in various formats
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Try ISO format first
  const isoDate = dayjs(dateStr);
  if (isoDate.isValid()) return isoDate.toDate();

  // Try DD-MM-YYYY
  const ddmmyyyy = dayjs(dateStr, "DD-MM-YYYY");
  if (ddmmyyyy.isValid()) return ddmmyyyy.toDate();

  // Try DD/MM/YYYY
  const ddmmyyyySlash = dayjs(dateStr, "DD/MM/YYYY");
  if (ddmmyyyySlash.isValid()) return ddmmyyyySlash.toDate();

  return null;
};

/**
 * Get date range for period
 */
export const getDateRangeForPeriod = (
  period: string,
  referenceDate?: Date
): { start: Date; end: Date } => {
  const ref = referenceDate ? dayjs(referenceDate) : dayjs();

  switch (period) {
    case "last-4-weeks": {
      const endOfWeek = ref.endOf("week");
      const startOfRange = endOfWeek.subtract(3, "week").startOf("week");
      return { start: startOfRange.toDate(), end: endOfWeek.toDate() };
    }
    case "last-2-months": {
      const startOfCurrentMonth = ref.startOf("month");
      const start = startOfCurrentMonth.subtract(1, "month");
      return { start: start.toDate(), end: ref.toDate() };
    }
    case "last-6-months": {
      const startOfCurrentMonth = ref.startOf("month");
      const start = startOfCurrentMonth.subtract(5, "month");
      return { start: start.toDate(), end: ref.toDate() };
    }
    default:
      return { start: ref.subtract(6, "month").toDate(), end: ref.toDate() };
  }
};

/**
 * Get months in range
 */
export const getMonthsInRange = (start: Date, end: Date): string[] => {
  const months: string[] = [];
  let current = dayjs(start).startOf("month");
  const endMonth = dayjs(end);

  while (current.isBefore(endMonth) || current.isSame(endMonth, "month")) {
    months.push(current.format("YYYY-MM"));
    current = current.add(1, "month");
  }

  return months;
};

/**
 * Get weeks in range
 */
export const getWeeksInRange = (
  start: Date,
  end: Date
): Array<{ start: Date; end: Date; label: string }> => {
  const weeks: Array<{ start: Date; end: Date; label: string }> = [];
  let current = dayjs(start).startOf("week");
  const endDate = dayjs(end);
  let weekNum = 1;

  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    const weekEnd = current.add(6, "day");
    weeks.push({
      start: current.toDate(),
      end: weekEnd.isAfter(endDate) ? endDate.toDate() : weekEnd.toDate(),
      label: `Week ${weekNum}`,
    });
    current = current.add(7, "day");
    weekNum++;
  }

  return weeks;
};
