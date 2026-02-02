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

  onclick(funct: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null) {
    this._overlay.onclick = funct;
  }

  show() {
    this._overlay.style.display = 'flex';
  }

  hide() {
    this._overlay.style.display = 'none';
  }

  private setSmallerStyles() {
    this._overlay.classList.remove('lg:text-7xl');
    this._overlay.classList.add('lg:text-6xl');
    this._overlay.classList.remove('md:text-5xl');
    this._overlay.classList.add('md:text-4xl');
    this._overlay.classList.remove('sm:text-3xl');
    this._overlay.classList.add('sm:text-2xl');
  }

  private setBiggerStyles() {
    this._overlay.classList.add('lg:text-7xl');
    this._overlay.classList.remove('lg:text-6xl');
    this._overlay.classList.add('md:text-5xl');
    this._overlay.classList.remove('md:text-4xl');
    this._overlay.classList.add('sm:text-3xl');
    this._overlay.classList.remove('sm:text-2xl');
  }

  setWaitingState() {
    this.setSmallerStyles();
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
  }

  setPauseState() {
    this.setSmallerStyles();
    this._spanMessage.innerHTML = 'FREE WIN IN 2 MINS.';
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
    this._overlay.append(this._spanMessage);
    this.show();
  }

  reset() {
    this.setBiggerStyles();
    this._spanMessage.innerHTML = 'CLICK HERE TO START!';
    this._overlay.innerHTML = 'READY TO PLAY?'
    this._overlay.append(this._spanMessage);
    this.show();
  }

  showMatchResult(score: number[]) {
    this.setBiggerStyles();
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
