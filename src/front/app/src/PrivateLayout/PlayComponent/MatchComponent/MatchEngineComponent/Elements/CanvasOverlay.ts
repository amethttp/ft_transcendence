import type Canvas from "./Canvas";

export default class CanvasOverlay {
  private _overlay: HTMLDivElement;

  constructor() {
    this._overlay = document.getElementById('matchCanvasOverlay') as HTMLDivElement;
    this._overlay.innerHTML = 'READY TO PLAY?<span class="text-2xl">CLICK HERE TO START!</span>';
  }

  onclick(funct: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null) {
    this._overlay.onclick = funct;
  }

  hide() {
    this._overlay.style.display = 'none';
  }

  setWaitingState() {
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
    this._overlay.classList.toggle('text-7xl');
    this._overlay.classList.toggle('text-6xl');
  }

  resizeAdjustingTo(canvas: Canvas) {
    this._overlay.style.width = canvas.cssWidth;
    this._overlay.style.height = canvas.cssHeight;
    this._overlay.style.left = canvas.cssLeftPos;
    this._overlay.style.top = canvas.cssTopPos;
  }
}