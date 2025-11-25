import type Canvas from "./Canvas";

const toFullscreenSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>`;

const toExitFullScreenSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
               </svg>`;

export default class FullScreenButton {
  private _button: HTMLButtonElement;
  private _isInFullScreen: boolean;

  constructor() {
    this._button = document.getElementById('canvasFullScreenBtn') as HTMLButtonElement;
    this._button.innerHTML = toFullscreenSvg;
    this._isInFullScreen = false;
  }

  onclick(funct: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null) {
    this._button.onclick = funct;
  }

  toggleIcon() {
    this._button.innerHTML = this._isInFullScreen ? toFullscreenSvg : toExitFullScreenSvg;
    this._isInFullScreen = !this._isInFullScreen;
  }

  resizeAdjustingTo(canvas: Canvas) {
    this._button.style.left = canvas.cssLeftPos;
    this._button.style.top = canvas.cssTopPos;
  }
}