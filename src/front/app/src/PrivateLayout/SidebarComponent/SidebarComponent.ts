import AmethComponent from "../../framework/AmethComponent";

export default class SidebarComponent extends AmethComponent {
  template = () => import("./SidebarComponent.html?raw");

  afterInit() {
    const resizer = document.getElementById('resizer')!;
    const sidebar = document.getElementById('_sidebar')!;

    function setWidth(width: number, offset: number = 0): void {
      const min = 50;
      const collapsed = 75;
      const max = window.innerWidth * .8;
      const newWidth = width - offset;

      if (newWidth <= collapsed) {
        sidebar.classList.add("collapsed");
      }
      else
        sidebar.classList.remove("collapsed");
      sidebar.style.width = Math.max(min, Math.min(newWidth, max)) + "px";
    }

    function setStoredWidth(): void {
      const sidebarX = localStorage.getItem("sidebar-x");
      if (sidebarX)
        setWidth(parseInt(sidebarX));
    }

    setStoredWidth();

    window.addEventListener("resize", () => { setStoredWidth() })

    // document.getElementById("nav")!.addEventListener("click", (e) => {
    //   if (sidebar.classList.contains("collapsed")) {
    //     e.preventDefault();
    //     e.stopImmediatePropagation();
    //     sidebar.classList.remove("collapsed");
    //     localStorage.setItem("sidebar-x", "200px");
    //   }
    // });

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
  }
}
