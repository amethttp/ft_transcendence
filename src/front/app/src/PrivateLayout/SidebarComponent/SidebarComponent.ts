import { LoggedUser } from "../../auth/LoggedUser";
import { AuthService } from "../../auth/services/AuthService";
import AmethComponent from "../../framework/AmethComponent";
import FriendsListSidebarComponent from "../FriendsComponent/FriendsListComponent/variants/FriendsListSidebarComponent/FriendsListSidebarComponent";

export default class SidebarComponent extends AmethComponent {
  template = () => import("./SidebarComponent.html?raw");
  friendsList!: FriendsListSidebarComponent;
  private resizeHandler?: () => void;
  private pointerDownHandler?: (e: PointerEvent) => void;
  private logoutHandler?: (e: Event) => void;

  async afterInit() {
    this.friendsList = new FriendsListSidebarComponent();
    await this.friendsList.init("SidebarFriendsList", this.router);
    this.friendsList.afterInit();
    this.setSidebarEvents();
    await this.setUserProfileView();
    this._checkRoutes();
  }

  private _checkRoutes() {
    const route = this.router?.currentPath.fullPath;
    if (route) {
      const url = new URL(route, location.origin);
      for (const link of [...document.getElementsByClassName("link")]) {
        if (link instanceof HTMLAnchorElement) {
          if (url.toString().startsWith(link.href))
            link.classList.add("highlighted");
          else
            link.classList.remove("highlighted");
        }
      }
    }
  }

  async refresh() {
    await this.setUserProfileView();
    this._checkRoutes();
    await this.friendsList.refresh();
  }

  private setSidebarEvents() {
    const resizer = document.getElementById('resizer')!;
    const sidebar = document.getElementById('_sidebar')!;

    function setWidth(width: number, offset: number = 0): void {
      const min = 50;
      const collapsed = 100;
      const max = window.innerWidth * .4;
      const newWidth = width - offset;

      if (newWidth <= collapsed) {
        sidebar.classList.add("collapsed");
      }
      else
        sidebar.classList.remove("collapsed");
      sidebar.style.width = Math.max(min, Math.min(newWidth, max)) + "px";
    }

    function setStoredWidth() {
      const sidebarX = localStorage.getItem("sidebar-x");
      if (sidebarX)
        setWidth(parseInt(sidebarX));
    }

    setStoredWidth();

    this.resizeHandler = () => { setStoredWidth() };
    window.addEventListener("resize", this.resizeHandler);

    this.pointerDownHandler = (e: PointerEvent) => {
      e.preventDefault();
      const offset = e.clientX - sidebar.clientWidth;

      function resize(ev: PointerEvent) {
        setWidth(ev.clientX, offset);
      }

      function stop() {
        localStorage.setItem("sidebar-x", sidebar.style.width);
        window.removeEventListener('pointermove', resize);
        window.removeEventListener('pointerup', stop);
      }

      window.addEventListener('pointermove', resize);
      window.addEventListener('pointerup', stop);
    };
    resizer.addEventListener('pointerdown', this.pointerDownHandler);

    const authService = new AuthService();
    this.logoutHandler = (e: Event) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      authService.logout().then(async res => {
        if (res.success) {
          this.router?.navigateByPath("/");
        }
      });
    };
    document.getElementById("sidebarLogOutBtn")?.addEventListener("click", this.logoutHandler);
  }

  private async setUserProfileView() {
    const userProfile = await LoggedUser.get();
    if (userProfile) {
      if (userProfile.avatarUrl)
        (document.getElementById("sidebarUserAvatar")! as HTMLImageElement).src = userProfile.avatarUrl;
      if (userProfile.username) {
        document.getElementById("sidebarUserName")!.innerText = userProfile.username;
        (document.getElementById("sidebarUserProfileAnchor")! as HTMLAnchorElement).href = "/profile/edit";
      }
    }
  }

  async destroy() {
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    if (this.pointerDownHandler) {
      document.getElementById('resizer')?.removeEventListener('pointerdown', this.pointerDownHandler);
    }
    if (this.logoutHandler) {
      document.getElementById("sidebarLogOutBtn")?.removeEventListener("click", this.logoutHandler);
    }

    await this.friendsList?.destroy();

    await super.destroy();
  }
}
