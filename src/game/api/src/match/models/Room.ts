import { Player } from "./Player";

export class Room {
  players: Record<string, Player>;
  matchState: "WAITING" | "READY" | "IN_PROGRESS" | "FINISHED";
  interval: any;

  constructor() {
    this.players = {};
    this.matchState = "WAITING";
  }

  public allPlayersReady(): boolean {
    const roomPlayers = Object.values(this.players);
    for (const player of roomPlayers) {
      if (player.state !== "READY") {
        return false;
      }
    }

    return true;
  }

  public getOpponent(playerId: string): { id: string, player: Player } {
    const roomPlayers = Object.keys(this.players);
    for (const player of roomPlayers) {
      if (player !== playerId) {
        return { id: player, player: this.players[player] };
      }
    }

    return { id: "", player: { name: "", state: "IDLE" } };
  }
} 
