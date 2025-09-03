export type ValidatorFn<T> = (value: T) => string | null;

export class Validators {
  static email: ValidatorFn<string> = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Invalid email format";
  };

  static requiredTrue: ValidatorFn<boolean> = (value: boolean) => {
    return value === true ? null : "Not true";
  };
}