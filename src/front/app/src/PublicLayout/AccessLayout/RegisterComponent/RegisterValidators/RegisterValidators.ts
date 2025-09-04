import type { AsyncValidatorFn } from "../../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { RegisterService } from "../services/RegisterService";

export class RegisterValidators {
  static usernameUnique: AsyncValidatorFn<string> = async (username: string) => {
    console.log("usernameUnique petition: ", username);
    try {
      const success = (await new RegisterService().usernameExists(username)).success;
      return !success ? null : "Username already in use";
    }
    catch (e) {
      return "Network connection error";
    }
  }

  static emailUnique: AsyncValidatorFn<string> = async (email: string) => {
    console.log("emailUnique petition: ", email);
    try {
      const success = (await new RegisterService().emailExists(email)).success;
      return !success ? null : "Email already in use";
    }
    catch (e) {
      return "Network connection error";
    }
  }
}