export type ValidatorFn<T> = (value: T) => string | null;

export class Validators {
  static email: ValidatorFn<string> = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Invalid email format";
  };

  static username: ValidatorFn<string> = (value: string) => {
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    return usernameRegex.test(value) ? null : "Username must be 5-20 characters and contain only letters and numbers";
  };

  static password: ValidatorFn<string> = (value: string) => {
    const passwordRegex = /^.{12,50}$/;
    return passwordRegex.test(value) ? null : "Password length must be between 12 and 50 characters.";
  };

  static requiredTrue: ValidatorFn<boolean> = (value: boolean) => {
    return value === true ? null : "Not true";
  };
}