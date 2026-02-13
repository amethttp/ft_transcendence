export type TimeAgoTextOptions = {
  justNow: string,
  secondsAgo: (seconds: number) => string,
  minutesAgo: (minutes: number) => string,
  hoursAgo: (hours: number) => string,
  daysAgo: (days: number) => string,
  weeksAgo: (weeks: number) => string,
  monthsAgo: (months: number) => string,
  yearsAgo: (years: number) => string,
};

const largeTextPlural = (val: number, text: string) => val > 1 ? `${val} ${text}s` : `${val} ${text}`;

export const timeAgoLargeText: TimeAgoTextOptions = {
  justNow: 'just now',
  secondsAgo: (seconds: number) => largeTextPlural(seconds, "second"),
  minutesAgo: (minutes: number) => largeTextPlural(minutes, "minute"),
  hoursAgo: (hours: number) => largeTextPlural(hours, "hour"),
  daysAgo: (days: number) => largeTextPlural(days, "day"),
  weeksAgo: (weeks: number) => largeTextPlural(weeks, "week"),
  monthsAgo: (months: number) => largeTextPlural(months, "month"),
  yearsAgo: (years: number) => largeTextPlural(years, "year"),
}

export const timeAgoSimpleText: TimeAgoTextOptions = {
  justNow: 'just now',
  secondsAgo: (seconds: number) => seconds + "s",
  minutesAgo: (minutes: number) => minutes + "m",
  hoursAgo: (hours: number) => hours + "h",
  daysAgo: (days: number) => days + "d",
  weeksAgo: (weeks: number) => weeks + "w",
  monthsAgo: (months: number) => months + "mo",
  yearsAgo: (years: number) => years + "y",
}

export type TimeAgoOptions = {
  from: string | Date,
  to?: string | Date,
  text?: {
    justNow: string,
    secondsAgo: (seconds: number) => string,
    minutesAgo: (minutes: number) => string,
    hoursAgo: (hours: number) => string,
    daysAgo: (days: number) => string,
    weeksAgo: (weeks: number) => string,
    monthsAgo: (months: number) => string,
    yearsAgo: (years: number) => string,
  }
};

export const timeAgo = (opts: TimeAgoOptions): string => {
  const fromDate = new Date(opts.from);
  const toDate = new Date(opts.to ?? new Date());
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (!opts.text) opts.text = timeAgoSimpleText;

  if (diffSec < 5) return opts.text.justNow;
  if (diffSec < 60) return `${opts.text.secondsAgo(diffSec)} ago`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${opts.text.minutesAgo(diffMin)} ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${opts.text.hoursAgo(diffH)} ago`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${opts.text.daysAgo(diffD)} ago`;

  const diffW = Math.floor(diffD / 7);
  if (diffW < 5) return `${opts.text.weeksAgo(diffW)} ago`;

  const diffM = Math.floor(diffD / 30);
  if (diffM < 12) return `${opts.text.monthsAgo(diffM)} ago`;

  const diffY = Math.floor(diffD / 365);
  return `${opts.text.yearsAgo(diffY)} ago`;
}

export default class DateUtils {

  static setMaxDate(dateInputId: string) {
    let today = new Date();
    let dayValue = today.getUTCDate();
    let day = dayValue.toString();
    let monthValue = today.getUTCMonth() + 1;
    let month = monthValue.toString();
    let year = today.getUTCFullYear().toString();

    if (dayValue < 10) {
      day = '0' + day;
    }

    if (monthValue < 10) {
      month = '0' + month;
    }

    let maxDate = year + '-' + month + '-' + day;
    document.getElementById(dateInputId)?.setAttribute("max", maxDate);
  }
}
