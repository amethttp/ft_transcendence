import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { timeAgo } from "../../utils/DateUtils";
import type UserProfileComponent from "../UserComponent/UserProfileComponent/UserProfileComponent";
import UserProfilePageComponent from "../UserComponent/UserProfileComponent/variants/UserProfilePageComponent/UserProfilePageComponent";
import UserStatsComponent from "../UserComponent/UserStatsComponent/UserStatsComponent";
import type { MatchInfo } from "../UserComponent/UserStatsComponent/models/MatchInfo";
import type { TournamentInfo } from "../UserComponent/UserStatsComponent/models/TournamentInfo";
import type { UserStats } from "../UserComponent/UserStatsComponent/models/UserStats";
import type UserProfile from "../UserComponent/models/UserProfile";
import UserProfileService from "../UserComponent/services/UserProfileService";

type RecentActivityItem = {
  kind: "match" | "tournament";
  title: string;
  detail: string;
  status: string;
  timestampText: string;
  sortTime: number;
  href?: string;
};

export default class HomeComponent extends AmethComponent {
  template = () => import("./HomeComponent.html?raw")

  protected userProfile?: UserProfile;
  protected userProfileComponent?: UserProfileComponent;
  protected userStats?: UserStatsComponent;
  private readonly userProfileService: UserProfileService;
  private readonly dailyTips = [
    "Warm up with a short local game before jumping online.",
    "Use slower returns to break aggressive opponent rhythms.",
    "In close games, win the center and force angled rebounds.",
    "Mix your serves every 2 points to stay unpredictable.",
    "Practice one calm rally after every intense point.",
    "Keep movement compact; over-correcting costs reaction time.",
    "When ahead, play safe percentages and protect your lead.",
  ];

  private readonly dailyChallenges = [
    "Win one match without conceding 5 points.",
    "Complete a best-of-three and close in the final game.",
    "Play one tournament match and reach at least semifinals.",
    "Win a game after trailing by 3 points.",
    "Finish a local match with at least 3 successful comebacks.",
    "Beat a friend and then rematch immediately.",
    "Play two matches in a row with no rage quits.",
  ];

  private readonly arenaQuotes = [
    "Legends are built one return at a time.",
    "Fast hands, calm mind, clean finish.",
    "The table remembers every comeback.",
    "Great players don’t chase points, they shape momentum.",
  ];

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
  }

  async afterInit() {
    await this.refresh();
  }

  async refresh() {
    this.userProfile = (await LoggedUser.get(true)) as unknown as UserProfile;
    if (!this.userProfile) return;

    this.hydrateHeroArea();
    await this.renderRecentActivity();

    this.userProfileComponent = new UserProfilePageComponent(this.userProfile);
    await this.userProfileComponent.init("HomeProfile", this.router);
    await this.userProfileComponent.afterInit();

    this.userStats = new UserStatsComponent(this.userProfile);
    await this.userStats.init("HomeStats", this.router);
    await this.userStats.afterInit();
  }

  private async renderRecentActivity() {
    const container = this.outlet?.querySelector("#HomeRecentActivity") as HTMLElement | null;

    if (!container || !this.userProfile?.username) {
      return;
    }

    container.innerHTML = '<p class="subtitle-3 text-center py-4">Loading activity...</p>';

    try {
      const stats = await this.userProfileService.getUserStats(this.userProfile.username) as UserStats;
      const items = this.buildRecentActivityItems(stats).slice(0, 8);
      this.renderMixedRecentActivity(container, items);
    } catch {
      container.innerHTML = '<p class="subtitle-3 text-center py-4">Could not load recent activity right now.</p>';
    }
  }

  private renderMixedRecentActivity(container: HTMLElement, items: RecentActivityItem[]) {
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = '<p class="subtitle-3 text-center py-4">No recent activity yet.</p>';
      return;
    }

    for (const item of items) {
      const card = item.kind === "tournament"
        ? document.createElement("a")
        : document.createElement("article");

      if (card instanceof HTMLAnchorElement && item.href) {
        card.href = item.href;
      }

      card.className = [
        "flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm",
        item.kind === "tournament" ? "transition hover:border-gray-300 hover:shadow-md" : ""
      ].join(" ").trim();

      const marker = document.createElement("div");
      marker.className = item.kind === "tournament"
        ? "mt-1 size-2.5 rounded-full bg-gray-700 shrink-0"
        : "mt-1 size-2.5 rounded-full bg-gray-400 shrink-0";

      const content = document.createElement("div");
      content.className = "flex min-w-0 flex-1 flex-col gap-1.5";

      const top = document.createElement("div");
      top.className = "flex flex-wrap items-center justify-between gap-2";

      const tag = document.createElement("span");
      tag.className = "text-[11px] uppercase tracking-wide subtitle-3";
      tag.textContent = item.kind === "tournament" ? "Tournament" : "Match";

      const title = document.createElement("p");
      title.className = "font-semibold";
      title.textContent = item.title;

      top.append(title, tag);

      const detail = document.createElement("p");
      detail.className = "subtitle-3";
      detail.textContent = item.detail;

      const footer = document.createElement("div");
      footer.className = "flex flex-wrap items-center justify-between gap-2";

      const status = document.createElement("span");
      status.className = "text-sm text-gray-700";
      status.textContent = item.status;

      const time = document.createElement("p");
      time.className = "text-xs italic subtitle-3";
      time.textContent = item.timestampText;

      footer.append(status, time);

      if (item.kind === "tournament") {
        const cta = document.createElement("span");
        cta.className = "text-sm text-gray-700 font-medium";
        cta.textContent = "Open tournaments →";
        footer.append(cta);
      }

      content.append(top, detail, footer);
      card.append(marker, content);
      container.append(card);
    }
  }

  private buildRecentActivityItems(stats: UserStats): RecentActivityItem[] {
    const matches = (stats.last10Matches || []).map((match) => this.mapMatchToActivity(match));
    const tournaments = (stats.last10Tournaments || []).map((tournament) => this.mapTournamentToActivity(tournament));

    return [...matches, ...tournaments].sort((a, b) => b.sortTime - a.sortTime);
  }

  private mapMatchToActivity(match: MatchInfo): RecentActivityItem {
    const isFinished = match.finishTime !== "Aborted";

    return {
      kind: "match",
      title: match.name,
      detail: `vs ${match.opponent?.username || "unknown"} • ${match.score}-${match.opponentScore}`,
      status: isFinished ? (match.isWinner ? "Win" : "Loss") : "In progress",
      timestampText: isFinished ? timeAgo({ from: match.finishTime }) : "Not finished",
      sortTime: isFinished ? new Date(match.finishTime).getTime() : 0,
    };
  }

  private mapTournamentToActivity(tournament: TournamentInfo): RecentActivityItem {
    const isFinished = tournament.finishTime !== "Aborted";

    return {
      kind: "tournament",
      title: tournament.name,
      detail: isFinished
        ? tournament.placement
          ? `Finished in top ${tournament.placement}`
          : "Finished tournament run"
        : "Tournament still in progress",
      status: isFinished ? "Tournament" : "Awaiting result",
      timestampText: isFinished ? timeAgo({ from: tournament.finishTime }) : "Not finished",
      sortTime: isFinished ? new Date(tournament.finishTime).getTime() : 0,
      href: "/play/tournaments",
    };
  }

  private hydrateHeroArea() {
    const name = this.userProfile?.username?.trim() || "Player";
    const weekday = new Date().toLocaleDateString(undefined, { weekday: "long" });
    const daySeed = new Date().getDay();

    const welcome = this.outlet?.querySelector("#HomeWelcomeTitle");
    const todayMessage = this.outlet?.querySelector("#HomeTodayMessage");
    const challengeMessage = this.outlet?.querySelector("#HomeChallengeMessage");
    const quote = this.outlet?.querySelector("#HomeQuote");

    if (welcome) {
      welcome.textContent = `Welcome back, ${name}`;
    }

    if (todayMessage) {
      todayMessage.textContent = `${weekday} tip: ${this.dailyTips[daySeed % this.dailyTips.length]}`;
    }

    if (challengeMessage) {
      challengeMessage.textContent = this.dailyChallenges[daySeed % this.dailyChallenges.length];
    }

    if (quote) {
      quote.textContent = this.arenaQuotes[daySeed % this.arenaQuotes.length];
    }
  }

  async destroy() {
    super.destroy();
    await Promise.all([this.userProfileComponent?.destroy(), this.userStats?.destroy()]);
    this.userProfileComponent = undefined;
    this.userStats = undefined;
  }
}
