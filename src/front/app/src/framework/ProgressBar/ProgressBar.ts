export class ProgressBar {
  private element: HTMLDivElement;
  private progressElement: HTMLDivElement;
  private targetProgress: number = 0;
  private isVisible: boolean = false;
  private hideTimeout: number | null = null;
  private showDelayTimeout: number | null = null;
  private incrementTimeout: number | null = null;
  private shownTime: number | null = null;
  private readonly SHOW_DELAY = 150;
  private readonly MIN_DISPLAY_TIME = 400;

  constructor() {
    this.element = document.createElement("div");
    this.element.className = "router-progress-bar";
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    this.progressElement = document.createElement("div");
    this.progressElement.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, rgb(189, 171, 236) 0%, rgb(159, 129, 226) 25%, rgb(142, 105, 216) 50%, rgb(124, 83, 197) 75%, rgb(104, 61, 177) 100%);
      width: 0%;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 10px rgba(142, 105, 216, 0.5);
    `;

    this.element.appendChild(this.progressElement);
    document.body.appendChild(this.element);
  }

  start() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    if (this.showDelayTimeout) {
      clearTimeout(this.showDelayTimeout);
      this.showDelayTimeout = null;
    }
    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
      this.incrementTimeout = null;
    }

    this.targetProgress = 0;
    this.isVisible = false;
    this.shownTime = null;
    this.setProgress(0);

    this.showDelayTimeout = window.setTimeout(() => {
      this.isVisible = true;
      this.shownTime = Date.now();
      this.element.style.opacity = "1";
      this.scheduleIncrement();
    }, this.SHOW_DELAY);
  }

  private scheduleIncrement() {
    if (!this.isVisible) return;

    const increment = (90 - this.targetProgress) * 0.1;
    this.targetProgress = Math.min(90, this.targetProgress + increment);
    this.setProgress(this.targetProgress);

    if (this.targetProgress < 90 && this.isVisible) {
      this.incrementTimeout = window.setTimeout(() => this.scheduleIncrement(), 200 + Math.random() * 300);
    }
  }

  setProgress(progress: number) {
    this.progressElement.style.width = `${progress}%`;
  }

  complete() {
    if (this.showDelayTimeout) {
      clearTimeout(this.showDelayTimeout);
      this.showDelayTimeout = null;
    }
    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
      this.incrementTimeout = null;
    }

    if (!this.isVisible) return;

    this.targetProgress = 100;
    this.setProgress(100);

    const displayTime = Date.now() - (this.shownTime || Date.now());
    const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - displayTime);

    this.hideTimeout = window.setTimeout(() => {
      this.element.style.opacity = "0";
      this.isVisible = false;

      setTimeout(() => {
        this.setProgress(0);
      }, 200);
    }, remainingTime + 300);
  }

  fail() {
    if (this.showDelayTimeout) {
      clearTimeout(this.showDelayTimeout);
      this.showDelayTimeout = null;
    }
    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
      this.incrementTimeout = null;
    }

    if (!this.isVisible) return;

    this.targetProgress = 100;
    this.progressElement.style.background = "#ef4444";

    const displayTime = Date.now() - (this.shownTime || Date.now());
    const remainingTime = Math.max(0, this.MIN_DISPLAY_TIME - displayTime);

    this.hideTimeout = window.setTimeout(() => {
      this.element.style.opacity = "0";
      this.isVisible = false;

      setTimeout(() => {
        this.setProgress(0);
        this.progressElement.style.background = "linear-gradient(90deg, rgb(189, 171, 236) 0%, rgb(159, 129, 226) 25%, rgb(142, 105, 216) 50%, rgb(124, 83, 197) 75%, rgb(104, 61, 177) 100%)";
      }, 200);
    }, remainingTime + 300);
  }

  destroy() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    if (this.showDelayTimeout) {
      clearTimeout(this.showDelayTimeout);
    }
    if (this.incrementTimeout) {
      clearTimeout(this.incrementTimeout);
    }
    this.element.remove();
  }
}
