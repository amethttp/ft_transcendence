export default class Validators {
  static email(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static username(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    return usernameRegex.test(username);
  }

  static password(password: string): boolean {
    const passwordRegex = /^.{8,50}$/;
    return passwordRegex.test(password);
  }

  static matchPasswords(inputPassword: string, userPassword: string): boolean {
    return inputPassword === userPassword;
  }
}