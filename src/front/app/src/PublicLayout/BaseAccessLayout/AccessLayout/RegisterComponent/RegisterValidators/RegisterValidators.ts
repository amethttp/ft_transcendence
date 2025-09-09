import type { AsyncValidatorFn } from "../../../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { RegisterService } from "../services/RegisterService";

export class RegisterValidators {
  static usernameUnique: AsyncValidatorFn<string> = async (username: string) => {
    try {
      const success = (await new RegisterService().usernameExists(username)).success;
      return !success ? null : "Username already in use";
    }
    catch (e) {
      return null;
    }
  }

  static emailUnique: AsyncValidatorFn<string> = async (email: string) => {
    try {
      const success = (await new RegisterService().emailExists(email)).success;
      return !success ? null : "Email already in use";
    }
    catch (e) {
      return null;
    }
  }
}