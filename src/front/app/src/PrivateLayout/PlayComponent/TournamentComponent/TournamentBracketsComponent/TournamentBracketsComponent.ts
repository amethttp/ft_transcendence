import { LoggedUser } from "../../../../auth/LoggedUser";
import AmethComponent from "../../../../framework/AmethComponent";
import { DOMHelper } from "../../../../utils/DOMHelper";
import type UserProfile from "../../../UserComponent/models/UserProfile";
import type { Tournament } from "../models/Tournament";
import { MatchState, type MatchStateValue, type TournamentMatch } from "../models/TournamentMatch";
import type { TournamentMatchPlayer } from "../models/TournamentMatchPlayer";
import { TournamentRound } from "../models/TournamentRound";

export default class TournamentBracketsComponent extends AmethComponent {
  template = () => import("./TournamentBracketsComponent.html?raw");
  private _tournament?: Tournament;
  private _loggedUsername: string;

  constructor() {
    super();
    this._loggedUsername = "";
  }

  async afterInit(tournament?: Tournament) {
    this._tournament = tournament;
    this._loggedUsername = (await LoggedUser.get())?.username || "";
    this._fillView();
  }

  refresh(tournament?: Tournament) {
    this._tournament = tournament;
    this._fillView();
  }

  private _clearView() {
    const container = this.outlet?.getElementsByClassName("TournamentBracketsContainer")[0]!;
    container.innerHTML = '';
  }

  private _fillView() {
    this._clearView();
    const container = this.outlet?.getElementsByClassName("TournamentBracketsContainer")[0]! as HTMLDivElement;
    console.log("tournament", this._tournament);
    if (!this._tournament)
      return;
    else if (this._tournament.rounds.length < 1) {
      container.innerText = "Waiting for players to start...";
    }
    else {
      this._fillRounds(container);
    }
  }

  private _fillRounds(container: HTMLDivElement) {
    if (!this._tournament)
      return;
    for (const round of this._tournament.rounds) {
      const roundI = TournamentRound.powersOfTwo.indexOf(Number(round.top));
      const htmlDiv = `
        <div class="flex flex-col w-fit gap-4">
          <div class="py-2">${TournamentRound.roundsText[roundI]}</div>
        </div>
      `;
      const div = DOMHelper.createElementFromHTML(htmlDiv) as HTMLDivElement;
      this._fillMatches(round, div);
      container.appendChild(div);
    }
  }

  private _fillMatches(round: TournamentRound, container: HTMLDivElement) {
    for (const match of round.matches) {
      const users = [
        this._tournament?.players.find(player => player.user.id == match.players[0].userId)?.user,
        this._tournament?.players.find(player => player.user.id == match.players[1].userId)?.user,
      ];
      const matchDiv = `
        <div class="flex p-3 flex-col gap-3 items-stretch rounded outline-1 outline-gray-400">
          <div class="flex flex-col gap-2">
            ${this._getPlayerDiv(match.players[0], users[0], match.state)}
            ${this._getPlayerDiv(match.players[1], users[1], match.state)}
          </div>
          ${this._getMatchStatus(match, users)}
        </div>
      `;
      container.appendChild(DOMHelper.createElementFromHTML(matchDiv));
    }
  }

  private _getMatchStatus(match: TournamentMatch, users: (UserProfile | undefined)[]): string {
    let status = `<span class="text-center text-xs">Waiting...</span>`;
    if (match.state === MatchState.FINISHED) {
      const winner = match.players.find(pl => pl.isWinner);
      const user = users.find((user) => user?.id == winner?.userId);
      status = `<span class="text-center text-xs">${user?.username} won</span>`;
    }
    else if (users.find(user => user?.username === this._loggedUsername)) {
      status = `
      <a href="/play/${match.token}" class="btn btn-primary text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        </svg>
        Play
      </a>`;
    }
    return status;
  }

  private _getPlayerDiv(player: TournamentMatchPlayer, user: UserProfile | undefined, matchState: MatchStateValue): string {
    return `
      <a href="/${user?.username}" class="flex justify-between items-center gap-6 outline-1 outline-gray-300 p-2 rounded hover:bg-brand-100 transition-colors">
        <div class="flex items-center gap-2">
          <img src="${user?.avatarUrl}"  width="30" height="30" class="aspect-square min-w-7 rounded-full overflow-hidden object-cover" />
          <span>${user?.username}</span>
        </div>
        <span>${matchState === MatchState.FINISHED ? player.score : "-"}</span>
      </a>
    `;
  }
}