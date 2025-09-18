export default class StringTime {
  static now(): string {
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return time;
  }

  static epoch(): string {
    const time = new Date(0).toISOString().replace('T', ' ').slice(0, 19);

    return time;
  }
}