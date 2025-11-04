import type Canvas from "./Canvas";

const spanElement = "<span id='canvasOverlaySpanMessage' class='text-sm sm:text-lg md:text-2xl'>CLICK HERE TO START!</span>";

export default class CanvasOverlay {
  private _overlay: HTMLDivElement;
  private _spanMessage: HTMLSpanElement;

  constructor() {
    this._overlay = document.getElementById('matchCanvasOverlay') as HTMLDivElement;
    this._overlay.innerHTML = 'READY TO PLAY?' + spanElement;
    this._spanMessage = document.getElementById('canvasOverlaySpanMessage') as HTMLSpanElement;
  }

  onclick(funct: ((this: GlobalEventHandlers, ev: PointerEvent) => any) | null) {
    this._overlay.onclick = funct;
  }

  hide() {
    this._overlay.style.display = 'none';
  }

  setWaitingState() {
    this._overlay.innerHTML = 'WAITING FOR OPPONENT...';
    this._overlay.classList.toggle('lg:text-7xl');
    this._overlay.classList.toggle('lg:text-6xl');
    this._overlay.classList.toggle('sm:text-3xl');
    this._overlay.classList.toggle('md:text-5xl');
    this._overlay.classList.toggle('md:text-4xl');
    this._overlay.classList.toggle('sm:text-2xl');
  }

  resizeAdjustingTo(canvas: Canvas) {
    this._overlay.style.width = canvas.cssWidth;
    this._overlay.style.height = canvas.cssHeight;
    this._overlay.style.left = canvas.cssLeftPos;
    this._overlay.style.top = canvas.cssTopPos;
  }
}