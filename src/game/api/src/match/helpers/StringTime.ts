export default class StringTime {
  static now(): string {
    return new Date().toISOString();
  }

  static epoch(): string {
    return new Date(0).toISOString();
  }

  static toTimestamp(dateStr: string): number {
    if (!dateStr.includes('T')) {
      dateStr = dateStr.replace(' ', 'T') + 'Z';
    }
    return new Date(dateStr).getTime();
  }

  static timeStampNow(): number {
    return new Date().getTime();
  }
}