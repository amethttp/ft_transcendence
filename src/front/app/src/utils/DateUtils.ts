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

  static timeAgo(from: string | Date, to: string | Date = new Date()): string {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    const diffMs = toDate.getTime() - fromDate.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 5) return "just now"
    if (diffSec < 60) return `${diffSec}s ago`

    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`

    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h ago`

    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d ago`

    const diffW = Math.floor(diffD / 7)
    if (diffW < 5) return `${diffW}w ago`

    const diffM = Math.floor(diffD / 30)
    if (diffM < 12) return `${diffM}mo ago`

    const diffY = Math.floor(diffD / 365)
    return `${diffY}y ago`
  }
}
