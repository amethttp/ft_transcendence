import { Validators, type ValidatorFn } from "../../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export class LoginValidators {
  static identifier: ValidatorFn<string> = (identifier: string) => {
    return Validators.email(identifier) === null || Validators.username(identifier) === null ? null : "Invalid username or email";
  }
}