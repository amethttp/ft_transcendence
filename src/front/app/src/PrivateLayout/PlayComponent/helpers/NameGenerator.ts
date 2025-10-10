export class NameGenerator {
  static readonly adjectives = [
    "Speedy",
    "Bouncy",
    "Smash",
    "Slick",
    "Flash",
    "Rebound",
    "Spin",
    "Hyper",
    "Ping",
    "Paddle"
  ] as const;

  static readonly nouns = [
    "Pongster",
    "Rally",
    "Ace",
    "Rocket",
    "Blaster",
    "Spike",
    "Slider",
    "Smash",
    "Orb",
    "Champion"
  ] as const;

  static readonly symbols = ["🏓", "⚡", "🔥", "💥", "⭐"] as const;

  static pickRandom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static generatePongName(): string {
    const adjective = this.pickRandom(this.adjectives);
    const noun = this.pickRandom(this.nouns);
    const symbol = this.pickRandom(this.symbols);
    return `${adjective} ${noun} ${symbol}`.trim();
  }
}