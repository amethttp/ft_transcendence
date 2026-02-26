export default class StringTime {
  static now(): string {
    return new Date().toISOString();
  }

  static epoch(): string {
    return new Date(0).toISOString();
  }
}