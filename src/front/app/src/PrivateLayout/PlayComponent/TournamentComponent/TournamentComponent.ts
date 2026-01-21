import { LoggedUser } from "../../../auth/LoggedUser";
import type User from "../../../auth/models/User";
import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import { TitleHelper } from "../../../framework/TitleHelper/TitleHelper";
import { DOMHelper } from "../../../utils/DOMHelper";
import { TournamentState, type Tournament } from "./models/Tournament";
import type { TournamentPlayer } from "./models/TournamentPlayer";
import { TournamentService } from "./services/TournamentService";
import TournamentBracketsComponent from "./TournamentBracketsComponent/TournamentBracketsComponent";

export default class TournamentComponent extends AmethComponent {
  template = () => import("./TournamentComponent.html?raw");
  private _tournamentService: TournamentService;
  private _tournament?: Tournament;
  private _bracketsComponent?: TournamentBracketsComponent;
  private _loggedUser?: User;
  private _loggedPlayer?: TournamentPlayer;

  constructor() {
    super();
    this._tournamentService = new TournamentService();
    this._bracketsComponent = new TournamentBracketsComponent();
  }

  async init(selector: string, router?: Router) {
    await super.init(selector, router);
    await this._bracketsComponent?.init("bracketsContainer", router);
  }

  async afterInit() {
    this._loggedUser = (await LoggedUser.get())!;
    await this._setTournament();
    this._bracketsComponent?.afterInit(this._tournament);
    this._fillView();
    this._setTitle();
  }

  async refresh() {
    await this._setTournament();
    this._bracketsComponent?.refresh(this._tournament);
    this._fillView();
    this._setTitle();
  }

  private _clearView() {
    document.getElementById("tournamentName")!.innerHTML = "";
    document.getElementById("tournamentVisibility")!.innerHTML = "";
    document.getElementById("tournamentPoints")!.innerHTML = "";
    document.getElementById("tournamentPlayersAmount")!.innerHTML = "";
    document.getElementById("tournamentPlayers")!.innerHTML = "";
    document.getElementById("tournamentToken")!.innerHTML = "";
    document.getElementById("startTournamentBtn")?.classList.add("hidden");
    document.getElementById("startTournamentBtn")?.removeAttribute("disabled");
    document.getElementById("startTournamentBtn")?.removeAttribute("title");
    document.getElementById("joinBtn")?.classList.add("hidden");
    document.getElementById("playMatchBtn")?.classList.add("hidden");
    document.getElementById("leaveBtn")?.classList.add("hidden");
  }

  private _fillView() {
    this._clearView();
    if (!this._tournament)
      return;
    document.getElementById("tournamentName")!.innerText = this._tournament.name;
    document.getElementById("tournamentVisibility")!.innerText = this._tournament.isVisible ? "Public" : "Private";
    document.getElementById("tournamentPoints")!.innerText = this._tournament.points + "";
    document.getElementById("tournamentPlayersAmount")!.innerText = this._tournament.playersAmount + "";
    this._fillActions(this._tournament);
    this._fillPlayers();
    document.getElementById("fillTournamentBtn")!.onclick = () => {
      this._tournamentService.fill(this._tournament!.token)
        .then(() => this.refresh())
        .catch(err => Alert.error("Error", JSON.stringify(err)));
    }
    this._togglePlayers();
  }

  private _togglePlayers() {
    const showBtn = document.getElementById("showPlayersBtn")!;
    const hideBtn = document.getElementById("hidePlayersBtn")!;
    const playersContainer = document.getElementById("tournamentPlayers")!;
    showBtn.onclick = () => {
      showBtn.classList.add("hidden");
      hideBtn.classList.remove("hidden");
      playersContainer.classList.remove("hidden");
    };
    hideBtn.onclick = () => {
      showBtn.classList.remove("hidden");
      hideBtn.classList.add("hidden");
      playersContainer.classList.add("hidden");
      showBtn.scrollIntoView({block: "center"});
    };
  }

  private async _fillActions(tournament: Tournament) {
    document.getElementById("tournamentToken")!.innerText = tournament.token;
    document.getElementById("copyLinkBtn")!.onclick = () => {
      navigator.clipboard.writeText(`${location.origin}/play/tournament/${tournament.token}`)
        .then(() => Alert.success("Link copied to clipboard!"))
        .catch(() => Alert.error("Could not copy link to clipboard"));
    };
    const loggedUsername = (await LoggedUser.get())?.username;
    const userJoined = tournament.players.find(player => player.user.username === loggedUsername);
    if (tournament.state === TournamentState.WAITING) {
      if (userJoined) {
        document.getElementById("leaveBtn")?.classList.remove("hidden");
        document.getElementById("leaveBtn")!.onclick = () => {
          this._tournamentService.leave(tournament.token)
            .then(() => this.refresh())
            .catch(() => Alert.error("Could not leave tournament"));
        }
        if (tournament.players[0].user.username === loggedUsername) {
          document.getElementById("startTournamentBtn")?.classList.remove("hidden");
          document.getElementById("startTournamentBtn")!.onclick = () => {
            this._tournamentService.start(tournament.token)
              .then(() => this.refresh())
              .catch(() => Alert.error("Could not start tournament"));
          }
          if (tournament.players.length !== tournament.playersAmount) {
            document.getElementById("startTournamentBtn")?.setAttribute("title", "Wait for opponents to start tournament");
            document.getElementById("startTournamentBtn")?.setAttribute("disabled", "true");
          }
        }
      }
      else if (tournament.players.length < tournament.playersAmount) {
        document.getElementById("joinBtn")?.classList.remove("hidden");
        document.getElementById("joinBtn")!.onclick = () => {
          this._tournamentService.join(tournament.token)
            .then(() => this.refresh())
            .catch(() => Alert.error("Could not join tournament"));
        }
      }
    }
    else if (tournament.state == TournamentState.IN_PROGRESS) {
      if (tournament.rounds.length > 0 && this._loggedPlayer?.round === tournament.round) {
        const nextMatch = tournament.rounds[tournament.rounds.length - 1].matches
          .find(match => match.players.find(pl => pl.userId === this._loggedUser?.id));
        if (nextMatch) {
          (document.getElementById("playMatchBtn") as HTMLAnchorElement).href = `/play/${nextMatch.token}`;
          document.getElementById("playMatchBtn")?.classList.remove("hidden");
        }
      }
    }
  }

  private _fillPlayers() {
    if (this._tournament && this._tournament.players && this._tournament.players.length > 0) {
      const container = document.getElementById("tournamentPlayers")!;
      for (const player of this._tournament.players.sort((a, b) => a.round - b.round)) {
        let status = "";
        if (player.round < this._tournament.round || (this._tournament.state === TournamentState.FINISHED && !player.isWinner)) {
          status = `<span class="text-xs top-0.5 relative bg-red-50 outline-1 outline-red-100 p-0.5 rounded">out</span>`;
        }
        else if (this._tournament.state === TournamentState.FINISHED && player.isWinner) {
          status = `<span class="text-xs top-0.5 relative bg-green-50 outline-1 outline-green-100 p-0.5 rounded">winner</span>`;
        }
        else {
          status = `<span class="text-xs top-0.5 relative bg-yellow-50 outline-1 outline-yellow-100 p-0.5 rounded">playing</span>`;
        }

        const htmlElem = `
          <a href="/${player.user.username}" class="flex items-center p-2 gap-2 rounded hover:bg-brand-100 transition-colors">
            <img src="${player.user.avatarUrl}" width="40" height="40" class="aspect-square w-10 h-10 rounded-full overflow-hidden object-cover" />
            <span>${DOMHelper.sanitizeHTML(player.user.username)}</span>
            ${status}
          </a>
        `;
        container.prepend(DOMHelper.createElementFromHTML(htmlElem));
      }
    }
  }

  private async _setTournament() {
    try {
      const token = this.router?.currentPath.params.token;
      if (token) {
        this._tournament = await this._tournamentService.getByToken(token as string);
        this._loggedPlayer = this._tournament.players.find(pl => pl.user.id === this._loggedUser?.id);
      }
    } catch (error) {
      this.router?.redirectByPath("/404")
    }
  }

  private _setTitle() {
    if (this._tournament) {
      document.title = TitleHelper.addTitlePart(this._tournament.name);
    }
  }
}