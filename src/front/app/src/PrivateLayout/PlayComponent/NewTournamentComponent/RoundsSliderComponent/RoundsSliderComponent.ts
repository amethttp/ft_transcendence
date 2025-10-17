import AmethComponent from "../../../../framework/AmethComponent";
import { FormControl } from "../../../../framework/Form/FormGroup/FormControl/FormControl";
import { TournamentRound } from "../../TournamentComponent/models/TournamentRound";

export default class RoundsSliderComponent extends AmethComponent {
  template = () => import("./RoundsSliderComponent.html?raw");
  private _control: FormControl<number>;
  private _label: string;

  constructor(label: string) {
    super();
    this._control = new FormControl(0);
    this._label = label;
  }

  get control(): FormControl<number> {
    return this._control;
  }

  afterInit() {
    if (!this.outlet)
      return;
  
    const id = Math.random().toString(36).slice(2);
    const label = this.outlet.getElementsByClassName("label")[0];
    label.innerHTML = this._label;
    label.setAttribute("for", id);
    const slider = this.outlet.getElementsByClassName("maxPlayers")[0] as HTMLInputElement;
    slider.id = id;
    slider.value = "1";
    const playersDisplay = this.outlet.getElementsByClassName("playersDisplay")[0] as HTMLElement;
    const roundsDisplay = this.outlet.getElementsByClassName("roundsDisplay")[0] as HTMLElement;

    const updateSlider = (): boolean => {
      const index = Math.trunc(Number(slider.value));
      const players = TournamentRound.powersOfTwo[index];
      if (this.control.value !== players) {
        this.control.setValue(players);
        const rounds = Math.log2(players);

        playersDisplay.textContent = `${players} players`;
        playersDisplay.style.transform = "scale(1.1)";
        setTimeout(() => (playersDisplay.style.transform = "scale(1)"), 120);

        roundsDisplay.textContent = `${rounds} rounds (${TournamentRound.roundsText[index] || ""})`;
        return true;
      }
      else {
        return false;
      }
    }
    updateSlider();

    slider.addEventListener("input", () => {
      if (updateSlider() && "vibrate" in navigator) navigator.vibrate(50);
    })
  }
}
