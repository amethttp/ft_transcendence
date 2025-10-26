import type Canvas from "./Canvas";

export default class CanvasOverlay {
  private _overlay: HTMLDivElement;

  constructor() {
    this._overlay = document.getElementById('matchCanvasOverlay') as HTMLDivElement;
    this._overlay.innerHTML = 'READY TO PLAY?';
  }

  onclick(funct: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null) {
    this._overlay.onclick = funct;
  }

  hide() {
    this._overlay.style.display = 'none';
  }

  setWaitingState() {
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
  }

  resizeAdjustingTo(canvas: Canvas) {
    this._overlay.style.width = canvas.cssWidth;
    this._overlay.style.height = canvas.cssHeight;
    this._overlay.style.left = canvas.cssLeftPos;
    this._overlay.style.top = canvas.cssTopPos;
  }
}