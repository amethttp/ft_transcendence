import type { AsyncValidatorFn } from "../../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { RegisterValidators } from "../../../../PublicLayout/BaseAccessLayout/AccessLayout/RegisterComponent/RegisterValidators/RegisterValidators";

export class UserEditValidators {
  static usernameUnique(_username: string): AsyncValidatorFn<string> {
    return async (username: string) => {
      if (_username !== username) return RegisterValidators.usernameUnique(username);
      else
        return null;
    }
  }

  static emailUnique(_email: string): AsyncValidatorFn<string> {
    return async (email: string) => {
      if (_email !== email) return RegisterValidators.emailUnique(email);
      else
        return null;
    }
  }
}