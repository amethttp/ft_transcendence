export default class Validators {
  static email(email: string): boolean {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    console.log(email);
    return false;
  }

  static username(username: string): boolean {
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
      return usernameRegex.test(username);
    }
    console.log(username);
    return false;
  }

  static password(password: string): boolean {
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,30}$/;
      return passwordRegex.test(password);
    }
    return false;
  }

  static matchPasswords(inputPassword: string, userPassword: string): boolean {
    return inputPassword === userPassword;
  }
}