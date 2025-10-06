import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import MatchEngineComponent from "./MatchEngineComponent/MatchEngineComponent";
import type { MatchJoin } from "./models/MatchJoin";
import { MatchService } from "./services/MatchService";

export default class MatchComponent extends AmethComponent {
  template = () => import("./MatchComponent.html?raw");
  private _matchEngineComponent?: MatchEngineComponent;
  private _matchService: MatchService;
  private _match?: MatchJoin;
  private _token?: string;

  constructor() {
    super();
    this._matchService = new MatchService();
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent = new MatchEngineComponent(this._token);
    await this._matchEngineComponent?.init("matchEngineContainer", this.router);
  }

  async setMatch(token: string) {
    try {
      this._match = await this._matchService.getJoinMatch(token);
      console.log(this._match);
    }
    catch (e: any) {
      if (e.status === 404)
        this.router?.redirectByPath('/404');
      console.warn(e);
    }
  }

  opponentConnected = (playerId: number) => {
    Alert.info(playerId + "");
  }

  async afterInit() {
    if (this._token)
      await this.setMatch(this._token);
    this._matchEngineComponent?.afterInit();
    this._matchEngineComponent?.on("opponentConnected", this.opponentConnected);
    this._fillView();
  }

  private _clearView() {

  }

  private _fillView() {
    this._clearView();
    if (!this._match)
      return;
    document.getElementById("MatchComponentMatchName")!.innerText = this._match.name;
    document.getElementById("MatchComponentVisibility")!.innerText = this._match.isVisible ? "Public" : "Private";
    document.getElementById("MatchComponentToken")!.innerText = this._match.token;
    document.getElementById("MatchComponentMaxPoints")!.innerText = this._match.points + "";
    document.getElementById("MatchComponentCopyTokenBtn")!.onclick = () => {
      navigator.clipboard.writeText(`${location.origin}/play/${this._match?.token}`)
        .then(() => Alert.success("Link copied to clipboard!"))
        .catch(() => Alert.error("Could not copy link to clipboard"));
    };

    document.getElementById("MatchComponentLeaveBtn")!.onclick = () => {
      this.router?.navigateByPath("/play");
      // TODO: If tournament go to tournament!
    }
  }

  async refresh() {
    const token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent?.refresh(token);
  }

  async destroy() {
    this._matchEngineComponent?.off("opponentConnected", this.opponentConnected);
    this._matchEngineComponent?.destroy();
    super.destroy();
  }
}
