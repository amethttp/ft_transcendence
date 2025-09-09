import type { FormControl } from "./FormControl/FormControl";

export class FormGroup<T extends { [key: string]: any }> {
  controls: { [K in keyof T]: FormControl<T[K]> };

  constructor(controls: { [K in keyof T]: FormControl<T[K]> }) {
    this.controls = controls;
  }

  get value(): T {
    const result: any = {};
    for (const key in this.controls) {
      result[key] = this.controls[key].value;
    }
    return result as T;
  }

  get valid(): boolean {
    return Object.values(this.controls).every(control => control.valid);
  }

  get errors(): { [K in keyof T]?: string[] } {
    const result: any = {};
    for (const key in this.controls) {
      if (!this.controls[key].valid) {
        result[key] = this.controls[key].errors;
      }
    }
    return result;
  }

  setValue(values: Partial<T>): void {
    for (const key in values) {
      if (this.controls[key]) {
        this.controls[key as keyof T].setValue(values[key as keyof T]!);
      }
    }
  }

  validate(): void {
    Object.values(this.controls).forEach(async c => {await c.validate()});
  }
}