import type { FormControl } from "./FormGroup/FormControl/FormControl";
import { FormGroup } from "./FormGroup/FormGroup";

export type submitFn<T> = (value: T) => void;

export class Form<T extends { [key: string]: any }> extends FormGroup<T> {
  private _form?: HTMLFormElement;
  private _inputs: Record<string, HTMLInputElement>;

  id: string;
  submit?: submitFn<T>;

  constructor(id: string, controls: { [K in keyof T]: FormControl<T[K]> }) {
    super(controls);
    this.id = id;
    this._form = document.getElementById(this.id) as HTMLFormElement;
    this._inputs = {};
    this.bindDOM();
  }

  private bindDOM() {
    if (!this._form)
      return console.warn(`Couldn't bind HTMLFormElement "#${this.id}" because it doesn't exist.`);
    for (const input of ([...this._form] as HTMLInputElement[])) {
      const control = this.controls[input.name];
      if (control) {
        this._inputs[input.name] = input;
        if (input.type === "checkbox") {
          input.checked = control.value;
          input.addEventListener("input", () => control.setValue(input.checked as T[string]));
        }
        else {
          input.value = control.value;
          input.addEventListener("input", () => control.setValue(input.value as T[string]));
        }
        input.addEventListener("input", () => {
          input.parentElement?.classList.add("touched");
          this.validate();
        });
      }
      else if (input.type === "submit") {
        input.addEventListener("click", e => {
          e.preventDefault();
          this._submit();
        });
      }
    }
    console.log(this._inputs);
  }

  touch() {
    for (const input of Object.values(this._inputs))
      input.parentElement?.classList.add("touched");
  }

  private _submit() {
    console.log("_submitted", this.valid, this.controls);
    this.touch();
    this.validate();
    if (this.valid && this.submit)
      this.submit(this.value);
    else if (!this.valid)
      this.focusInvalid();
  }

  focusInvalid() {
    for (const input of Object.values(this._inputs)) {
      if (input.hasAttribute("aria-invalid")) {
        input.focus({ preventScroll: true });
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  }

  validate(): void {
    Object.keys(this.controls).forEach((k: string) => {
      this.controls[k].validate();
      if (this.controls[k]?.valid) {
        this._inputs[k]?.removeAttribute("aria-invalid");
        this._inputs[k]?.parentElement?.classList.remove("invalid");
        if (this._inputs[k]?.parentNode?.querySelector(".error"))
          (this._inputs[k].parentNode?.querySelector(".error") as HTMLParagraphElement).innerText = "";
      }
      else {
        if (this._inputs[k]?.parentElement?.classList.contains("touched")
          && this._inputs[k]?.parentNode?.querySelector(".error"))
          (this._inputs[k].parentNode?.querySelector(".error") as HTMLParagraphElement).innerText = this.controls[k].errors.join(" and ");
        this._inputs[k]?.setAttribute("aria-invalid", "true");
        this._inputs[k]?.parentElement?.classList.add("invalid");
      }
    });
  }
}