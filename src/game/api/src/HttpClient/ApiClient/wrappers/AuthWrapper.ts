export class AuthWrapper {
  auth: string;
  value: any;

  constructor(auth: string, value: any) {
    this.auth = auth;
    this.value = value;
  }
}