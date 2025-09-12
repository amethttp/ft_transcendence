import { LoggedUser } from "../../auth/LoggedUser";
import { AuthService } from "../../auth/services/AuthService";
import AmethComponent from "../../framework/AmethComponent";

export default class SidebarComponent extends AmethComponent {
  template = () => import("./SidebarComponent.html?raw");

  afterInit() {
    this.setUserProfileView();
    this.setSidebarEvents();
    this.refresh();
  }

  refresh() {
    const route = this.router?.currentPath.fullPath;
    if (route) {
      for (const link of [...document.getElementsByClassName("link")]) {
        if (link instanceof HTMLAnchorElement) {
          if (link.href === new URL(route, location.origin).toString())
            link.classList.add("highlighted");
          else
            link.classList.remove("highlighted");
        }
      }
    }
  }

  private setSidebarEvents() {
    const resizer = document.getElementById('resizer')!;
    const sidebar = document.getElementById('_sidebar')!;

    function setWidth(width: number, offset: number = 0): void {
      const min = 50;
      const collapsed = 100;
      const max = window.innerWidth * .8;
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
    document.getElementById("logOutBtn")?.addEventListener("click", (e) => {
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
      (document.getElementById("userAvatar")! as HTMLImageElement).src = userProfile.avatar_url;
      document.getElementById("userName")!.innerText = userProfile.username;
    }
  }

  async destroy() {

  }
}
