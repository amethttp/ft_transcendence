export default class Validators {
  static email(email: string): boolean {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]+/;
    return emailRegex.test(email);
  }

  static username(username: string): boolean {
    const usernameRegex = /^[\w-]{5,20}$/;
    return usernameRegex.test(username);
  }

  static password(password: string): boolean {
    const passwordRegex = /^.{8,50}$/;
    return passwordRegex.test(password);
  }
}
