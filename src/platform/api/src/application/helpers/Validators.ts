export default class Validators {
  static email(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static username(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
    return usernameRegex.test(username);
  }

  static password(password: string): boolean {
    const passwordRegex = /^.{8,50}$/;
    return passwordRegex.test(password);
  }
}
