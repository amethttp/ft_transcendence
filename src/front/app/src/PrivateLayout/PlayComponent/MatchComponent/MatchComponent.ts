import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import { TitleHelper } from "../../../framework/TitleHelper/TitleHelper";
import { TournamentRound } from "../TournamentComponent/models/TournamentRound";
import MatchEngineComponent from "./MatchEngineComponent/MatchEngineComponent";
import type { MatchJoin } from "./models/MatchJoin";
import type { MatchPlayer } from "./models/MatchPlayer";
import PlayerComponent, { type PlayerOptions } from "./PlayerComponent/PlayerComponent";
import { MatchService } from "./services/MatchService";

export const PlayerType = {
  CPU: 0,
  LOCAL: 1
} as const;

export type PlayerTypeValue = typeof PlayerType[keyof typeof PlayerType];

export default class MatchComponent extends AmethComponent {
  template = () => import("./MatchComponent.html?raw");
  private static readonly PLAYERS_OPTS: Record<PlayerTypeValue, PlayerOptions> = [
    {
      name: "AI",
      avatar: "/ai-player.webp",
      local: true
    },
    {
      name: "Player 2",
      avatar: "/player2.webp",
      local: true,
      controls: true
    }
  ];
  private _matchEngineComponent?: MatchEngineComponent;
  private _matchService: MatchService;
  private _match?: MatchJoin;
  private _token?: string;
  private _ownerPlayerComponent?: PlayerComponent;
  private _opponentPlayerComponent?: PlayerComponent;

  constructor() {
    super();
    this._matchService = new MatchService();
  }

  opponentConnected = (userId: number) => {
    this._matchService.getPlayer(userId, this._match?.id || -1).then(
      val => {
        this._opponentPlayerComponent?.refresh(this._getPlayerOpts(val));
        this._showOpponentPlayer();
      })
      .catch(() => Alert.error("Some error occurred with opponent"));
  }

  matchEnded = (won: boolean) => {
    // alert("Match ended! You " + (won ? "won!" : "lost!"));
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
    }
    catch (e: any) {
      if (e.status === 404)
        this.router?.redirectByPath('/404');
      console.warn(e);
    }
  }

  async afterInit() {
    if (this._token)
      await this.setMatch(this._token);
    await this._initPlayers();
    this._fillView();
    this._matchEngineComponent?.on("opponentConnected", this.opponentConnected);
    this._matchEngineComponent?.on("matchEnded", this.matchEnded);
    this._matchEngineComponent?.afterInit();
  }

  private _getPlayerOpts(player?: MatchPlayer): PlayerOptions | undefined {
    let opts;
    if (player) {
      opts = {
        name: player.user.username,
        avatar: player.user.avatarUrl
      }
    }
    return opts;
  }

  private async _initPlayers() {
    this._ownerPlayerComponent = new PlayerComponent(this._getPlayerOpts(this._match?.players[0]));
    await this._ownerPlayerComponent.init("ownerPlayerComponent");
    this._ownerPlayerComponent.afterInit();
    this._opponentPlayerComponent = new PlayerComponent(this._getPlayerOpts(this._match?.players[1]));
    await this._opponentPlayerComponent.init("opponentPlayerComponent");
    this._opponentPlayerComponent.afterInit();
  }

  private _clearView() {
    document.getElementById("MatchComponentTournamentName")!.innerText = "";
    document.getElementById("MatchComponentTournamentRound")!.innerText = "";
    document.getElementById("MatchComponentMatchName")!.innerText = "";
    document.getElementById("MatchComponentVisibility")!.innerText = "";
    document.getElementById("MatchComponentTournamentElem")?.classList.add("hidden");
    document.getElementById("MatchComponentNameElem")?.classList.add("hidden");
    document.getElementById("MatchComponentToken")!.innerText = "";
    document.getElementById("MatchComponentMaxPoints")!.innerText = "";
    document.getElementById("MatchComponentOpponentPlayer")!.classList.add("hidden");
    document.getElementById("MatchComponentSelectPlayer")?.classList.remove("hidden");
  }

  private _showOpponentPlayer() {
    document.getElementById("MatchComponentOpponentPlayer")?.classList.remove("hidden");
    document.getElementById("MatchComponentSelectPlayer")?.classList.add("hidden");
  }

  private _fillView() {
    this._clearView();
    if (!this._match)
      return;
    this._fillNameView(this._match);
    document.getElementById("MatchComponentToken")!.innerText = this._match.token;
    document.getElementById("MatchComponentMaxPoints")!.innerText = this._match.points + "";
    this._fillOpponentView();
    document.getElementById("MatchComponentCopyTokenBtn")!.onclick = () => {
      navigator.clipboard.writeText(`${location.origin}/play/${this._match?.token}`)
        .then(() => Alert.success("Link copied to clipboard!"))
        .catch(() => Alert.error("Could not copy link to clipboard"));
    };
    document.getElementById("MatchComponentLeaveBtn")!.onclick = () => {
      if (this._match?.tournamentRound?.tournament)
        this.router?.navigateByPath(`/play/tournament/${this._match.tournamentRound.tournament.token}`);
      else
        this.router?.navigateByPath("/play");
    }
  }

  private _fillNameView(match: MatchJoin) {
    if (match.tournamentRound?.tournament) {
      document.getElementById("MatchComponentTournamentElem")?.classList.add("flex");
      document.getElementById("MatchComponentTournamentElem")?.classList.remove("hidden");
      const roundName = TournamentRound.getRoundTextFromTop(match.tournamentRound.top);
      const name = `${roundName} - ${match.tournamentRound.tournament.name}`;
      document.getElementById("MatchComponentTournamentName")!.innerText = match.tournamentRound.tournament.name;
      document.getElementById("MatchComponentTournamentRound")!.innerText = roundName;
      (document.getElementById("MatchComponentTournamentElem")! as HTMLAnchorElement).href = `/play/tournament/${match.tournamentRound.tournament.token}`;
      document.title = TitleHelper.addTitlePart(name);
    }
    else {
      document.getElementById("MatchComponentNameElem")?.classList.add("flex");
      document.getElementById("MatchComponentNameElem")?.classList.remove("hidden");
      document.getElementById("MatchComponentMatchName")!.innerText = match.name;
      document.getElementById("MatchComponentVisibility")!.innerText = match.isVisible ? "Public" : "Private";
      document.title = TitleHelper.addTitlePart(match.name);
    }
  }

  private _fillOpponentView() {
    if (this._opponentPlayerComponent?.player)
      this._showOpponentPlayer();
    else {
      document.getElementById("MatchComponentSelectPlayer")!.onchange = (e) => {
        const val = parseInt((e.target as HTMLSelectElement).value);
        if (Object.values(PlayerType).includes(val as PlayerTypeValue)) {
          this._matchEngineComponent?.setPlayer(val as PlayerTypeValue);
          this._opponentPlayerComponent?.refresh(MatchComponent.PLAYERS_OPTS[val as PlayerTypeValue]);
          this._showOpponentPlayer();
        }
      };
    }
  }

  async refresh() {
    const token = this.router?.currentPath.params["token"] as string;
    await this.setMatch(token);
    this._matchEngineComponent?.refresh(token);
    this._ownerPlayerComponent?.refresh(this._getPlayerOpts(this._match?.players[0]));
    this._opponentPlayerComponent?.refresh(this._getPlayerOpts(this._match?.players[1]));
    this._fillView();
  }

  async destroy() {
    // this._matchEngineComponent?.off("opponentConnected", this.opponentConnected);
    await this._matchEngineComponent?.destroy();
    await this._ownerPlayerComponent?.destroy();
    await this._opponentPlayerComponent?.destroy();
    await super.destroy();
  }
}
