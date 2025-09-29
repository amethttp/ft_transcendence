import AmethComponent from "../../../framework/AmethComponent";
import UserProfileService from "../services/UserProfileService";
import type { UserStats } from "./models/UserStats";
import { PieChart, type AnimationDefinition, easings } from 'chartist';
import 'chartist/dist/index.css';

export default class UserStatsComponent extends AmethComponent {
  template = () => import("./UserStatsComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected targetUser: string;
  private mode: "match" | "tournament" | "none";

  constructor(targetUser: string) {
    super();
    this.userProfileService = new UserProfileService();
    this.targetUser = targetUser;
    this.mode = "none";
  }

  private animateCounter(
    el: HTMLElement,
    to: number,
    duration: number = 1500,
    decimals: number = 0
  ) {
    const start = 0;
    const startTime = performance.now();

    function easeOutCube(t: number): number {
      return 1 - Math.pow(1 - t, 5);
    }

    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCube(progress);
      const current = start + (to - start) * eased;

      el.innerText = current.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  private animatePathDraw(
    path: SVGPathElement,
    duration: number = 1000,
    delay: number = 0
  ) {
    const length = path.getTotalLength();
    if (length === 0) return;

    path.style.strokeDasharray = length.toString();
    path.style.strokeDashoffset = length.toString();

    function easeOutCube(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    setTimeout(() => {
      const startTime = performance.now();

      function draw(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCube(progress);

        path.style.strokeDashoffset = (length * (1 - easedProgress)).toString();
        path.style.opacity = easedProgress.toString();

        if (progress < 1) {
          requestAnimationFrame(draw);
        } else {
          path.style.opacity = '1';
        }
      }

      requestAnimationFrame(draw);
    }, delay);
  }

  private displayTournamentHistory(matchHistoryList: HTMLUListElement, userStats: UserStats) {
    if (this.mode === "tournament") { return; }
    this.mode = "tournament";
    matchHistoryList.innerHTML = "";
    if (!userStats.last10Tournaments || !userStats.last10Tournaments.length) {
      const fallback = document.createElement("span");
      fallback.innerHTML = "No tournaments yet...";
      fallback.classList.add("subtitle-3", "text-center");
      matchHistoryList.append(fallback);
      return;
    }

    for (const tournament of userStats.last10Tournaments) {
      const div = document.createElement("div");
      div.className = "py-3 flex flex-col justify-between items-center gap-2 bg-gray-50 rounded-lg";

      const tournamentLabel = document.createElement("span");
      tournamentLabel.textContent = `${tournament.name.toUpperCase()}`;

      const playersSpan = document.createElement("span");
      playersSpan.classList.add("flex", "flex-wrap", "items-center", "gap-4", "w-full");

      const userLabel = document.createElement("span");
      userLabel.classList.add("flex", "flex-wrap", "flex-1", "justify-center", "gap-3");

      const tournamentSize = document.createElement("span");
      tournamentSize.textContent = "/ " + tournament.playerAmount.toString();
      tournamentSize.classList.add("font-semibold");
      const userScore = document.createElement("span");
      userScore.textContent = tournament.placement.toString();
      userScore.classList.add("text-brand-900", "font-bold");

      userLabel.append(userScore, tournamentSize);

      playersSpan.append(
        userLabel,
      );

      const footerLabel = document.createElement("span");
      footerLabel.classList.add("flex", "flex-col", "justify-between", "items-center");

      const timeStamp = document.createElement("span");
      timeStamp.textContent = tournament.finishTime;
      timeStamp.classList.add("text-xs", "italic");

      footerLabel.append(timeStamp);

      div.appendChild(tournamentLabel);
      div.appendChild(playersSpan);
      div.appendChild(footerLabel);
      matchHistoryList.appendChild(div);
    }
  }

  private displayMatchHistory(matchHistoryList: HTMLUListElement, userStats: UserStats) {
    if (this.mode === "match") { return; }
    this.mode = "match";
    matchHistoryList.innerHTML = "";
    if (!userStats.last10Matches || !userStats.last10Matches.length) {
      const fallback = document.createElement("span");
      fallback.innerHTML = "No matches yet...";
      fallback.classList.add("subtitle-3", "text-center");
      matchHistoryList.append(fallback);
    }

    for (const match of userStats.last10Matches) {
      const div = document.createElement("div");
      div.className = "py-3 flex flex-wrap flex-col justify-between items-center gap-2 bg-gray-50 rounded-lg";

      const matchLabel = document.createElement("span");
      matchLabel.textContent = `${match.name.toUpperCase()}`;

      const playersSpan = document.createElement("span");
      playersSpan.classList.add("flex", "flex-wrap", "items-center", "gap-4", "w-full");

      const userLabel = document.createElement("span");
      userLabel.classList.add("flex", "flex-wrap", "flex-1", "justify-end", "gap-3");

      const userName = document.createElement("a");
      userName.href = `/${this.targetUser}`;
      userName.textContent = `${this.targetUser}`;
      userName.classList.add("hover:bg-brand-200", "transition", "duration-200", "rounded-lg", "px-2");
      const userScore = document.createElement("span");
      userScore.textContent = match.score.toString();
      userScore.classList.add("text-brand-900", "font-semibold");

      const vsText = document.createElement("span");
      vsText.textContent = " VS ";
      vsText.classList.add("font-semibold");

      const opponentLabel = document.createElement("span");
      opponentLabel.classList.add("flex", "flex-wrap", "flex-1", "justify-start", "gap-3");

      const opponentName = document.createElement("a");
      opponentName.href = `/${match.opponent.username}`
      opponentName.textContent = `${match.opponent.username}`;
      opponentName.classList.add("hover:bg-brand-200", "transition", "duration-200", "rounded-lg", "px-2");
      const opponentScore = document.createElement("span");
      opponentScore.textContent = match.opponentScore.toString();
      opponentScore.classList.add("text-brand-900", "font-semibold");

      userLabel.append(userName, userScore);
      opponentLabel.append(opponentScore, opponentName);

      playersSpan.append(
        userLabel,
        vsText,
        opponentLabel,
      );

      const footerLabel = document.createElement("span");
      footerLabel.classList.add("flex", "flex-col", "justify-between", "items-center");

      const resultSpan = document.createElement("span");
      resultSpan.className = "font-semibold";

      if (match.finishTime !== 'Aborted') {
        if (match.isWinner) {
          resultSpan.textContent = "win";
          resultSpan.classList.add("text-green-400");
        } else {
          resultSpan.textContent = "loss";
          resultSpan.classList.add("text-red-400");
        }
      }

      const timeStamp = document.createElement("span");
      timeStamp.textContent = match.finishTime;
      timeStamp.classList.add("text-xs", "italic");

      footerLabel.append(resultSpan, timeStamp);

      div.appendChild(matchLabel);
      div.appendChild(playersSpan);
      div.appendChild(footerLabel);
      matchHistoryList.appendChild(div);
    }
  }

  async afterInit() {
    const stats = await this.userProfileService.getUserStats(this.targetUser) as UserStats;
    const winRate = Math.round((stats.matchesWon / stats.totalMatches) * 100) || 0;
    const losses = stats.totalMatches - stats.matchesWon || 0;
    const testTournamentAvg = stats.tournamentAvg || 0;
    const testTournamentAmount = stats.totalTournaments || 0;

    const matchCenterText = document.getElementById('matchChart-center-text');
    const matchSpan = document.getElementById('matchTotal') as HTMLElement;
    matchSpan.innerText = stats.totalMatches.toString();
    if (matchCenterText && matchSpan) {
      matchCenterText.classList.remove('hidden');
      matchCenterText.classList.add('opacity-100');
      this.animateCounter(matchSpan, stats.totalMatches, 2500);
    }

    const tournamentCenterText = document.getElementById('tournamentStats-center-text');
    const tournamentSpan = document.getElementById('tournamentAvg') as HTMLElement;
    tournamentSpan.innerText = testTournamentAvg.toString();
    const tournamentSpanTotal = document.getElementById('tournamentTotal') as HTMLElement;
    if (tournamentCenterText && tournamentSpan && tournamentSpanTotal) {
      tournamentCenterText.classList.remove('hidden');
      tournamentCenterText.classList.add('opacity-100');
      this.animateCounter(tournamentSpan, testTournamentAvg, 2500, 1);
      this.animateCounter(tournamentSpanTotal, testTournamentAmount, 2500);
    }

    const podiumOutline = document.querySelector('.podium');
    if (podiumOutline) {
      setTimeout(() => {
        podiumOutline.classList.add('opacity-100');
      }, 500);
    }

    document.querySelectorAll('.podiumPath').forEach((path) => {
      this.animatePathDraw(path as SVGPathElement, 2500);
    });

    const matchHistoryList = document.getElementById("match-history-list") as HTMLUListElement;
    const matchHistoryBtn = document.getElementById("matchHistory-btn") as HTMLButtonElement;
    const tournamentHistoryBtn = document.getElementById("tournamentHistory-btn") as HTMLButtonElement;
    if (matchHistoryList) {
      this.displayMatchHistory(matchHistoryList, stats);
      matchHistoryBtn.onclick = () => {
        tournamentHistoryBtn.classList.remove("active");
        matchHistoryBtn.classList.add("active");
        this.displayMatchHistory(matchHistoryList, stats);
      };
      tournamentHistoryBtn.onclick = () => {
        matchHistoryBtn.classList.remove("active");
        tournamentHistoryBtn.classList.add("active");
        this.displayTournamentHistory(matchHistoryList, stats);
      };
    }

    let checkSliceData: boolean = false;
    if (stats.matchesWon || losses) {
      checkSliceData = true;
    }
    const matchChart = new PieChart('#matchChart', {
      series: [{
        value: stats.matchesWon,
        name: "wins",
        className: "stroke-green-400",
      }, {
        value: losses,
        name: "losses",
        className: "stroke-red-400",
      }],
      labels: [winRate + '%', 100 - winRate + '%']
    },
      {
        donut: true,
        showLabel: checkSliceData,
      }
    );

    matchChart.on('draw', data => {
      if (!stats.matchesWon && !losses) { return; }
      document.querySelectorAll('.ct-label').forEach(label => {
        (label as SVGElement).classList.add('opacity-0', 'transition-opacity', 'duration-700');
        setTimeout(() => (label as SVGElement).classList.add('opacity-100'), 1500);
      });
      if (data.type === 'slice') {
        const pathLength = data.element
          .getNode<SVGGeometryElement>()
          .getTotalLength();

        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });

        const animationDefinition: Record<string, AnimationDefinition> = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1000,
            from: -pathLength + 'px',
            to: '0px',
            easing: easings.easeInOutCubic,
            fill: 'freeze'
          }
        };

        if (data.index !== 0) {
          animationDefinition['stroke-dashoffset'].begin =
            'anim' + (data.index - 1) + '.end';
        }
        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });

        data.element.animate(animationDefinition, false);
      }
    });
  }

  refresh() { // TODO: reset more stuff here?
    document.querySelector('#matchChart')!.innerHTML = '';
    this.afterInit();
  }
}
