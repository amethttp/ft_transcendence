import { LoggedUser } from "../../../../auth/LoggedUser";
import AmethComponent from "../../../../framework/AmethComponent"

export interface PlayerOptions {
  name: string;
  avatar: string;
  local?: boolean;
}

export default class PlayerComponent extends AmethComponent {
  template = () => import("./PlayerComponent.html?raw");
  private _player?: PlayerOptions;

  constructor(player?: PlayerOptions) {
    super();
    this._player = player;
  }

  get player(): PlayerOptions | undefined {
    return this._player;
  }

  async afterInit() {
    await this.fillView();
  }

  async refresh(player?: PlayerOptions) {
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
    if (this._player) {
      if (!this.player?.local) {
        (this.outlet?.getElementsByClassName("PlayerComponentAnchor")[0] as HTMLAnchorElement).href = `/${this._player.name}`;
      }
      (this.outlet?.getElementsByClassName("PlayerComponentImage")[0] as HTMLImageElement).src = `${this._player.avatar}`;
      (this.outlet?.getElementsByClassName("PlayerComponentName")[0] as HTMLElement).innerText = this._player.name === (await LoggedUser.get())?.username ? "You" : this._player.name;
    }
  }
}