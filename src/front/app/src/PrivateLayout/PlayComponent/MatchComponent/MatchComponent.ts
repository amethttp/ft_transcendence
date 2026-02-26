import { LoggedUser } from "../../../auth/LoggedUser";
import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import { TitleHelper } from "../../../framework/TitleHelper/TitleHelper";
import { TournamentRound } from "../TournamentComponent/models/TournamentRound";
import { MatchEndedMenu } from "./MatchEndedMenu/MatchEndedMenu";
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

type MatchComponentResolvedData = { match: MatchJoin };

export default class MatchComponent extends AmethComponent<MatchComponentResolvedData> {
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
  private _matchEndedMenu?: MatchEndedMenu;

  constructor() {
    super();
    this._matchService = new MatchService();
  }

  opponentConnected = (userId: number) => {
    if (!this._match || (this._match.tournamentRound && this._match.tournamentRound.tournament))
      return;
    this._matchService.getPlayer(userId, this._match?.id || -1)
    .then(val => {
      this._opponentPlayerComponent?.refresh(this._getPlayerOpts(val));
      this._showOpponentPlayer();
    })
      .catch(() => Alert.error("Some error occurred with opponent"));
  }

  opponentLeft = async () => {
    if (!this._match)
      return;
    const loggedName = (await LoggedUser.get())!.username;
    const loggedPlayer = this._match?.players.find(pl => pl.user.username === loggedName)!;
    const loggedIndex = this._match?.players.indexOf(loggedPlayer);
    if (loggedIndex === 1) {
      this._match.players[0] = this._match.players[1];
    }
    this._match.players.splice(1, 1);
    this._ownerPlayerComponent?.refresh(this._getPlayerOpts(this._match.players[0]));
    this._opponentPlayerComponent?.refresh(this._getPlayerOpts(this._match.players[1]));
    this._hideOpponentPlayer();
  }

  matchEnded = (score: number[]) => {
    this.setTimeout(async () => {
      if (this._match?.tournamentRound?.tournament) {
        document.getElementById("matchFinishMenuContainer")!.classList.add("visible", "z-50", "opacity-100");
        const username = (await LoggedUser.get())?.username;
        const playerIndex = this._match.players.findIndex(player => player.user.username === username);
        const winnerScoreIndex = score.findIndex(s => s === Math.max(...score));
        this._matchEndedMenu = new MatchEndedMenu(playerIndex === winnerScoreIndex, this.router, this._match?.tournamentRound?.tournament);
        this._matchEndedMenu.init("matchFinishMenuContainer", this.router).then(() => {
          this._matchEndedMenu?.afterInit();
        });
      }
    }, 1000);
  }

  async init(selector: string, router?: Router, resolvedData?: MatchComponentResolvedData): Promise<void> {
    await super.init(selector, router, resolvedData);
    this._token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent = new MatchEngineComponent(this._token);
    await this._matchEngineComponent?.init("matchEngineContainer", this.router);
  }

  setMatch() {
    if (this.resolverData?.match) {
      this._match = this.resolverData?.match;
      return true;
    }
    else
      return false;
  }

  async afterInit() {
    if (!this.setMatch())
      return;
    await this._initPlayers();
    this._fillView();
    if (this._matchEngineComponent) {
      this._matchEngineComponent.on("opponentConnected", this.opponentConnected);
      this._matchEngineComponent.on("matchEnded", this.matchEnded);
      this._matchEngineComponent.on("opponentLeft", this.opponentLeft);
      this._matchEngineComponent.afterInit();
    }
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
    document.getElementById("MatchComponentOpponentPlayer")!.classList.remove("flex");
    document.getElementById("MatchComponentSelectPlayer")?.classList.remove("hidden");
  }

  private _showOpponentPlayer() {
    document.getElementById("MatchComponentOpponentPlayer")?.classList.replace("hidden", "flex");
    document.getElementById("MatchComponentSelectPlayer")?.classList.add("hidden");
  }

  private _hideOpponentPlayer() {
    document.getElementById("MatchComponentOpponentPlayer")?.classList.replace("flex", "hidden");
    document.getElementById("MatchComponentSelectPlayer")?.classList.remove("hidden");
  }

  private _fillView(refreshTitlePart: boolean = false) {
    this._clearView();
    if (!this._match)
      return;
    this._fillNameView(this._match, refreshTitlePart);
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

  private _fillNameView(match: MatchJoin, refreshTitlePart: boolean = false) {
    if (match.tournamentRound?.tournament) {
      document.getElementById("MatchComponentTournamentElem")?.classList.add("flex");
      document.getElementById("MatchComponentTournamentElem")?.classList.remove("hidden");
      const roundName = TournamentRound.getRoundTextFromTop(match.tournamentRound.top);
      const name = `${roundName} - ${match.tournamentRound.tournament.name}`;
      document.getElementById("MatchComponentTournamentName")!.innerText = match.tournamentRound.tournament.name;
      document.getElementById("MatchComponentTournamentRound")!.innerText = roundName;
      (document.getElementById("MatchComponentTournamentElem")! as HTMLAnchorElement).href = `/play/tournament/${match.tournamentRound.tournament.token}`;
      TitleHelper.setTitlePart(name, refreshTitlePart);
    }
    else {
      document.getElementById("MatchComponentNameElem")?.classList.add("flex");
      document.getElementById("MatchComponentNameElem")?.classList.remove("hidden");
      document.getElementById("MatchComponentMatchName")!.innerText = match.name;
      document.getElementById("MatchComponentVisibility")!.innerText = match.isVisible ? "Public" : "Private";
      TitleHelper.setTitlePart(match.name, refreshTitlePart);
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

  refresh() {
    const token = this.router?.currentPath.params["token"] as string;
    this.setMatch();
    this._matchEngineComponent?.refresh(token);
    this._ownerPlayerComponent?.refresh(this._getPlayerOpts(this._match?.players[0]));
    this._opponentPlayerComponent?.refresh(this._getPlayerOpts(this._match?.players[1]));
    this._fillView(true);
  }

  async destroy() {
    await this._matchEngineComponent?.destroy();
    await this._ownerPlayerComponent?.destroy();
    await this._opponentPlayerComponent?.destroy();
    await this._matchEndedMenu?.destroy();
    await super.destroy();
  }
}
