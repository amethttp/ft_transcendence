import type { FormControl } from "../../../../framework/Form/FormGroup/FormControl/FormControl";
import type { ValidatorFn } from "../../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export class RegisterValidators {
  static passwordRepeat: ValidatorFn<string> = (value: string) => {
    const _value = (this as any as FormControl<string>).value;
    return  _value === value ? null : "Password must be 8-30 characters and include uppercase, lowercase, number, and special character.";
  };
}