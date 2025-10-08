import { LoggedUser } from "../../../../auth/LoggedUser";
import AmethComponent from "../../../../framework/AmethComponent"
import type { MatchPlayer } from "../models/MatchPlayer";

export default class PlayerComponent extends AmethComponent {
  template = () => import("./PlayerComponent.html?raw");
  private _player?: MatchPlayer;

  constructor(player?: MatchPlayer) {
    super();
    this._player = player;
  }

  async afterInit() {
    await this.fillView();
  }

  async refresh(player?: MatchPlayer) {
    this._player = player;
    await this.fillView();
  }

  clearView() {
    (this.outlet?.getElementsByClassName("PlayerComponentAnchor")[0] as HTMLAnchorElement).removeAttribute("href");
    (this.outlet?.getElementsByClassName("PlayerComponentImage")[0] as HTMLImageElement).src = "/default-avatar.webp";
    (this.outlet?.getElementsByClassName("PlayerComponentName")[0] as HTMLElement).innerText = "Player";
  }

  async fillView() {
    this.clearView();
    if (!this._player)
      return;
    (this.outlet?.getElementsByClassName("PlayerComponentAnchor")[0] as HTMLAnchorElement).href = `/${this._player.user.username}`;
    (this.outlet?.getElementsByClassName("PlayerComponentImage")[0] as HTMLImageElement).src = `${this._player.user.avatarUrl}`;
    (this.outlet?.getElementsByClassName("PlayerComponentName")[0] as HTMLElement).innerText = this._player.user.username === (await LoggedUser.get())?.username ? "You" : this._player.user.username;
  }
}