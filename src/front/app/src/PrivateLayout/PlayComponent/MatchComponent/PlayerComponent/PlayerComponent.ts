import { LoggedUser } from "../../../../auth/LoggedUser";
import AmethComponent from "../../../../framework/AmethComponent"

export interface PlayerOptions {
  name: string;
  avatar: string;
  local?: boolean;
  controls?: boolean;
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
    this.outlet?.getElementsByClassName("PlayerComponentControls")[0].classList.add("hidden");
    this.outlet?.getElementsByClassName("PlayerComponentOtherControls")[0].classList.add("hidden");
  }

  async fillView() {
    this.clearView();
    if (this._player) {
      (this.outlet?.getElementsByClassName("PlayerComponentImage")[0] as HTMLImageElement).src = `${this._player.avatar}`;
      let name = this._player.name;
      let isLogged = name === (await LoggedUser.get())?.username;
      if (isLogged) {
        name = "You";
        this.outlet?.getElementsByClassName("PlayerComponentControls")[0].classList.remove("hidden");
      }
      (this.outlet?.getElementsByClassName("PlayerComponentName")[0] as HTMLElement).innerText = name;
      if (!this.player?.local && !isLogged)
        (this.outlet?.getElementsByClassName("PlayerComponentAnchor")[0] as HTMLAnchorElement).href = `/profile/${this._player.name}`;
      if (this.player?.controls)
        this.outlet?.getElementsByClassName("PlayerComponentOtherControls")[0].classList.remove("hidden");
    }
  }
}