import { LoggedUser } from "../../auth/LoggedUser";
import { AuthService } from "../../auth/services/AuthService";
import AmethComponent from "../../framework/AmethComponent";
import FriendsListComponent from "../FriendsComponent/FriendsListComponent/FriendsListComponent";

export default class SidebarComponent extends AmethComponent {
  template = () => import("./SidebarComponent.html?raw");
  friendsList!: FriendsListComponent;

  async afterInit() {
    this.friendsList = new FriendsListComponent();
    await this.friendsList.init("SidebarFriendsList", this.router);
    this.friendsList.afterInit();
    this.setSidebarEvents();
    this.refresh();
  }
  
  async refresh() {
    await this.setUserProfileView();
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
    this.friendsList.refresh();
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

    window.addEventListener("resize", () => { setStoredWidth() })

    resizer.addEventListener('pointerdown', e => {
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

      window.addEventListener('pointermove', resize)
      window.addEventListener('pointerup', stop)
    })

    const authService = new AuthService();
    document.getElementById("sidebarLogOutBtn")?.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      authService.logout().then(async res => {
        if (res.success) {
          await LoggedUser.get(true);
          this.router?.navigateByPath("/");
        }
      });
    });
  }

  private async setUserProfileView() {
    const userProfile = await LoggedUser.get();
    if (userProfile) {
      if (userProfile.avatarUrl)
        (document.getElementById("sidebarUserAvatar")! as HTMLImageElement).src = userProfile.avatarUrl;
      if (userProfile.username) {
        document.getElementById("sidebarUserName")!.innerText = userProfile.username;
        (document.getElementById("sidebarUserProfileAnchor")! as HTMLAnchorElement).href = "/" + userProfile.username;
      }
    }
  }

  async destroy() {

  }
}
