import type { AsyncValidatorFn, ValidatorFn } from "./Validators/Validators";

export class FormControl<T> {
  private _value: T;
  private _errors: string[] = [];
  private validators: (ValidatorFn<T> | AsyncValidatorFn<T>)[];

  constructor(initialValue: T, validators: (ValidatorFn<T> | AsyncValidatorFn<T>)[] = []) {
    this._value = initialValue;
    this.validators = validators;
    this.validate();
  }

  get value(): T {
    return this._value;
  }

  get valid(): boolean {
    return this._errors.length === 0;
  }

  get errors(): string[] {
    return this._errors;
  }

  setValue(newValue: T, validate: boolean = true): void {
    this._value = newValue;
    if (validate)
      this.validate();
  }

  async validate() {
    this._errors = (await Promise.all(
      this.validators.map(fn => fn(this._value))
    )).filter((err): err is string => err !== null);
  }
}
