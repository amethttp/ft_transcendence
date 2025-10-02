import { Player } from "./Player";

export class Room {
  players: Record<string, Player>;
  matchState: "WAITING" | "READY" | "IN_PROGRESS" | "FINISHED";

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
} 
