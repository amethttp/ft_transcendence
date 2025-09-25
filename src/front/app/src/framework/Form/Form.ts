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
        if (control.validators.length > 0)
          this.createErrorMsg(input);
        if (input.type === "checkbox") {
          input.checked = control.value;
          input.parentElement?.classList.add("touched");
          input.addEventListener("input", () => control.setValue(input.checked as T[string], false));
        }
        else {
          input.value = control.value;
          input.addEventListener("input", () => control.setValue(input.value as T[string], false));
        }
        input.addEventListener("input", async () => {
          input.parentElement?.classList.add("dirty");
          await this.validate();
        });
        const onBlur = async () => {
          input.parentElement?.classList.add("touched");
          await this.validate();
          input.removeEventListener("blur", onBlur);
        };
        input.addEventListener("blur", onBlur);
      }
      else if (input.type === "submit") {
        input.addEventListener("click", async e => {
          e.preventDefault();
          await this._submit();
        });
      }
    }
    this._form.onsubmit = async e => {
      e.preventDefault();
      await this._submit();
    }
  }

  private createErrorMsg(input: HTMLInputElement) {
    const msg = document.createElement("p");
    msg.classList.add("error");
    input.parentElement?.appendChild(msg);
  }

  touchDirtyAll() {
    for (const input of Object.values(this._inputs)) {
      input.parentElement?.classList.add("touched");
      input.parentElement?.classList.add("dirty");
    }
  }

  private async _submit() {
    this.touchDirtyAll();
    await this.validate();
    if (this.valid && this.submit)
      this.submit(this.value);
    else if (!this.valid)
      this.focusInvalid();
  }

  focusInvalid() {
    for (const input of Object.values(this._inputs)) {
      if (input.hasAttribute("aria-invalid")) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
        input.focus({ preventScroll: true });
        break;
      }
    }
  }

  async validate() {
    for (const k of Object.keys(this.controls)) {
      await this.controls[k].validate();
      if (this.controls[k]?.valid) {
        this._inputs[k]?.removeAttribute("aria-invalid");
        this._inputs[k]?.parentElement?.classList.remove("invalid");
        if (this._inputs[k]?.parentNode?.querySelector(".error"))
          (this._inputs[k].parentNode?.querySelector(".error") as HTMLParagraphElement).innerText = "";
      }
      else {
        if (this._inputs[k]?.parentElement?.classList.contains("touched")
          && this._inputs[k]?.parentElement?.classList.contains("dirty")
          && this._inputs[k]?.parentNode?.querySelector(".error"))
          (this._inputs[k].parentNode?.querySelector(".error") as HTMLParagraphElement).innerText = this.controls[k].errors.join(" and ");
        this._inputs[k]?.setAttribute("aria-invalid", "true");
        this._inputs[k]?.parentElement?.classList.add("invalid");
      }
    }
  }
}