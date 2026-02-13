import type { FormControl } from "../FormControl";

export type ValidatorFn<T> = (value: T) => string | null;
export type AsyncValidatorFn<T> = (value: T) => Promise<string | null>;

export class Validators {
  static email: ValidatorFn<string> = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value) ? null : "Invalid email address";
  };

  static username: ValidatorFn<string> = (value: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
    return usernameRegex.test(value) ? null : "5-20 characters, letters and numbers only";
  };

  static password: ValidatorFn<string> = (value: string) => {
    const passwordRegex = /^.{8,50}$/;
    if (value.length < 8)
      return "Password too short! Must contain at least 8 characters"
    else if (value.length > 50)
      return "Password too long! Can contain up to 50 characters"
    else
      return passwordRegex.test(value) ? null : "Invalid password";
  };

  static requiredTrue: ValidatorFn<boolean> = (value: boolean) => {
    return value === true ? null : "Not true";
  };

  static length(min: number, max: number): ValidatorFn<string> {
    return (value: string) => {
      if (value.length < min) return "Min. length is " + min;
      else if (value.length > max) return "Max. length is " + max;
      else return null;
    }
  }

  static passwordRepeat(passwdControl: FormControl<string>): ValidatorFn<string> {
    return (value: string) => {
      return passwdControl.value === value ? null : "Passwords do not match";
    }
  };

  private static isOverSixteenYears(formDate: Date, currentDate: Date) {
    const formDateJson = { y: formDate.getUTCFullYear(), m: formDate.getUTCMonth() + 1, d: formDate.getUTCDate() };
    const currentDateJson = { y: currentDate.getUTCFullYear(), m: currentDate.getUTCMonth() + 1, d: currentDate.getUTCDate() };

    let years = currentDateJson.y - formDateJson.y;
    if (currentDateJson.m < formDateJson.m
      || (currentDateJson.m === formDateJson.m && currentDateJson.d < formDateJson.d)) {
      years -= 1;
    }

    return years >= 16;
  }

  static isValidBirthDate: ValidatorFn<string> = (dateString: string) => {
    const formDate: Date = new Date(dateString);
    const currentDate: Date = new Date();

    if (isNaN(formDate.getTime()))
      return 'Invalid date format (MM-DD-YYYY)';

    if (formDate.getTime() > currentDate.getTime())
      return 'Are you a time traveler?'

    if (!Validators.isOverSixteenYears(formDate, currentDate))
      return 'Only users older than 16 years old are allowed to play in our platform'

    return null;
  }

  static minMax(min: number, max: number): ValidatorFn<number> {
    return (value: number) => {
      if (value < min) return "Minimum " + min;
      else if (value > max) return "Maximum " + max;
      else return null;
    }
  }
}
