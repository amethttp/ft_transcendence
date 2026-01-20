import type Canvas from "./Canvas";

export default class CanvasOverlay {
  private _overlay: HTMLDivElement;
  private _spanMessage: HTMLSpanElement;

  constructor() {
    this._overlay = document.getElementById('matchCanvasOverlay') as HTMLDivElement;
    this._spanMessage = document.getElementById('canvasOverlaySpanMessage') as HTMLSpanElement;
    this._spanMessage.innerHTML = 'CLICK HERE TO START!';
    this._overlay.innerHTML = 'READY TO PLAY?'
    this._overlay.append(this._spanMessage);
  }

  onclick(funct: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null) {
    this._overlay.onclick = funct;
  }

  show() {
    this._overlay.style.display = 'flex';
  }

  hide() {
    this._overlay.style.display = 'none';
  }

  private changeStyles() {
    this._overlay.classList.toggle('lg:text-7xl');
    this._overlay.classList.toggle('lg:text-6xl');
    this._overlay.classList.toggle('md:text-5xl');
    this._overlay.classList.toggle('md:text-4xl');
    this._overlay.classList.toggle('sm:text-3xl');
    this._overlay.classList.toggle('sm:text-2xl');
  }

  setWaitingState() {
    this.changeStyles();
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
  }

  showMatchResult(score: number[]) {
    this.changeStyles();
    this._spanMessage.innerHTML = `${score[0]} - ${score[1]}`;
    this._overlay.innerHTML = 'MATCH OVER!';
    this._overlay.append(this._spanMessage);
    this.show();
  }

  resizeAdjustingTo(canvas: Canvas) {
    this._overlay.style.width = canvas.cssWidth;
    this._overlay.style.height = canvas.cssHeight;
    this._overlay.style.left = canvas.cssLeftPos;
    this._overlay.style.top = canvas.cssTopPos;
  }

  disable() {
    this._overlay.onclick = null;
    this._overlay.classList.remove('cursor-pointer');
  }
}