export default class Validators {
  static email(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static username(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
    return usernameRegex.test(username);
  }

  static password(password: string): boolean {
    const passwordRegex = /^.{8,50}$/;
    return passwordRegex.test(password);
  }

  private static isOverSixteenYears(formDate: Date, currentDate: Date) {
    const formDateJson = { y: formDate.getUTCFullYear(), m: formDate.getUTCMonth(), d: formDate.getUTCDate() };
    const currentDateJson = { y: currentDate.getUTCFullYear(), m: currentDate.getUTCMonth(), d: currentDate.getUTCDate() };

    let years = currentDateJson.y - formDateJson.y;
    if (currentDateJson.m < formDateJson.m
      || (currentDateJson.m === formDateJson.m && currentDateJson.d < formDateJson.d)) {
      years -= 1;
    }

    return years >= 16;
  }

  static birthDate(birthDate: string): boolean {
    const formDate: Date = new Date(birthDate);
    const currentDate: Date = new Date();

    if (isNaN(formDate.getTime()))
      return false;

    if (formDate.getTime() > currentDate.getTime())
      return false;

    if (!Validators.isOverSixteenYears(formDate, currentDate))
      return false;

    return true;
  }
}
