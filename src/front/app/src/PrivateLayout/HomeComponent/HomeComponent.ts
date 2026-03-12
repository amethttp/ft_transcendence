import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { timeAgo } from "../../utils/DateUtils";
import type { MatchInfo } from "../UserComponent/UserStatsComponent/models/MatchInfo";
import type { TournamentInfo } from "../UserComponent/UserStatsComponent/models/TournamentInfo";
import type { UserStats } from "../UserComponent/UserStatsComponent/models/UserStats";
import type UserProfile from "../UserComponent/models/UserProfile";
import UserProfileService from "../UserComponent/services/UserProfileService";

type RecentActivityItem = {
  type: "match" | "tournament";
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
  private readonly userProfileService: UserProfileService;

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
  }

  private async renderRecentActivity() {
    const container = this.outlet?.querySelector("#HomeRecentActivity") as HTMLElement | null;

    if (!container || !this.userProfile?.username) {
      return;
    }

    container.innerHTML = '<p class="subtitle-3 text-center py-4">Loading activity...</p>';
    this.resetQuickStats("Loading recent match data...");

    try {
      const stats = await this.userProfileService.getUserStats(this.userProfile.username) as UserStats;
      const items = this.buildRecentActivityItems(stats).slice(0, 10);
      this.renderMixedRecentActivity(container, items);
      this.renderQuickStats(stats);
    } catch {
      container.innerHTML = '<p class="subtitle-3 text-center py-4">Could not load recent activity right now.</p>';
      this.resetQuickStats("Could not load recent match data right now.");
    }
  }

  private renderMixedRecentActivity(container: HTMLElement, items: RecentActivityItem[]) {
    container.innerHTML = "";

    if (!items.length) {
      container.innerHTML = '<p class="subtitle-3 text-center py-4">No recent activity yet.</p>';
      return;
    }

    for (const item of items) {
      const card = item.type === "tournament"
        ? document.createElement("a")
        : document.createElement("div");

      if (card instanceof HTMLAnchorElement && item.href) {
        card.href = item.href;
      }

      card.className = [
        "flex items-center justify-between gap-3 px-3 py-3 text-sm",
        "border-b border-gray-700 last:border-b-0",
        item.type === "tournament" ? "cursor-pointer transition-opacity hover:opacity-80" : ""
      ].join(" ").trim();

      const left = document.createElement("div");
      left.className = "flex items-center gap-3 min-w-0";

      const marker = document.createElement("div");
      marker.className = "mt-0.5 size-2 shrink-0 rounded-full border border-current";

      const title = document.createElement("p");
      title.className = "truncate font-medium";
      title.textContent = item.title;

      const detail = document.createElement("p");
      detail.className = "truncate text-xs";
      detail.textContent = item.detail;

      const content = document.createElement("div");
      content.className = "flex min-w-0 flex-col";
      content.append(title, detail);
      left.append(marker, content);

      const footer = document.createElement("div");
      footer.className = "flex shrink-0 flex-col items-end gap-0.5 text-right";

      const status = document.createElement("span");
      const isWin = item.status === "Win";
      const isLoss = item.status === "Loss";
      let statusClass = "text-xs font-medium";
      if (isWin) statusClass += " text-green-500";
      else if (isLoss) statusClass += " text-red-500";
      status.className = statusClass;
      status.textContent = item.status;

      const time = document.createElement("span");
      time.className = "text-[10px]";
      time.textContent = item.timestampText;

      footer.append(status, time);
      card.append(left, footer);
      container.append(card);
    }
  }

    private renderQuickStats(stats: UserStats) {
      const winrateElement = this.outlet?.querySelector("#HomeQuickStatsWinrate") as HTMLElement | null;
      const totalElement = this.outlet?.querySelector("#HomeQuickStatsTotal") as HTMLElement | null;
      const summaryElement = this.outlet?.querySelector("#HomeQuickStatsSummary") as HTMLElement | null;

      if (!winrateElement || !totalElement || !summaryElement) {
        return;
      }

      const matches = stats.last10Matches || [];
      const total = matches.length;

      if (!total) {
        this.resetQuickStats("No recent matches yet.");
        return;
      }

      const wins = matches.filter((match) => match.isWinner).length;
      const losses = total - wins;
      const winrate = Math.round((wins / total) * 100);

      winrateElement.textContent = `${winrate}%`;
      totalElement.textContent = total.toString();
      summaryElement.textContent = `${wins} win${wins === 1 ? "" : "s"} · ${losses} loss${losses === 1 ? "" : "es"}`;
    }

    private resetQuickStats(summary: string) {
      const winrateElement = this.outlet?.querySelector("#HomeQuickStatsWinrate") as HTMLElement | null;
      const totalElement = this.outlet?.querySelector("#HomeQuickStatsTotal") as HTMLElement | null;
      const summaryElement = this.outlet?.querySelector("#HomeQuickStatsSummary") as HTMLElement | null;

      if (winrateElement) {
        winrateElement.textContent = "--%";
      }

      if (totalElement) {
        totalElement.textContent = "0";
      }

      if (summaryElement) {
        summaryElement.textContent = summary;
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
      type: "match",
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
      type: "tournament",
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

    const welcome = this.outlet?.querySelector("#HomeWelcomeTitle");
    const avatarInitial = this.outlet?.querySelector("#HomeAvatarInitial") as HTMLElement | null;
    const avatarImage = this.outlet?.querySelector("#HomeAvatarImage") as HTMLImageElement | null;

    if (welcome) {
      welcome.textContent = `Welcome back, ${name}`;
    }

    if (avatarInitial) {
      avatarInitial.textContent = name.charAt(0).toUpperCase();
    }

    if (avatarImage) {
      const avatarUrl = this.userProfile?.avatarUrl?.trim();
      if (avatarUrl) {
        avatarImage.src = avatarUrl;
        avatarImage.classList.remove("hidden");
        avatarInitial?.classList.add("hidden");
        avatarImage.onerror = () => {
          avatarImage.classList.add("hidden");
          avatarInitial?.classList.remove("hidden");
        };
      } else {
        avatarImage.classList.add("hidden");
        avatarInitial?.classList.remove("hidden");
      }
    }
  }

  async destroy() {
    super.destroy();
  }
}
