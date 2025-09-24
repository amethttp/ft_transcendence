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
