export type ValidatorFn<T> = (value: T) => string | null;
export type AsyncValidatorFn<T> = (value: T) => Promise<string | null>;

export class Validators {
  static email: ValidatorFn<string> = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
}