import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { NameGenerator } from "../helpers/NameGenerator";
import { PlayerType, type PlayerTypeValue } from "../MatchComponent/MatchComponent";
import type { NewMatchRequest } from "./models/NewMatchRequest";
import { NewMatchService } from "./services/NewMatchService";

export default class NewMatchComponent extends AmethComponent {
  template = () => import("./NewMatchComponent.html?raw");
  private _form?: Form<NewMatchRequest> | null;
  private _service: NewMatchService;
  private _iaVisibilityPreference: boolean = true;
  private _iaVisibilityInitialized: boolean = false;

  constructor() {
    super();
    this._service = new NewMatchService();
  }

  private updateVisibilityToggle(mode: number) {
    const visibilityField = document.getElementById("visibilityField");
    const visibilityToggle = document.getElementById("visibilityToggle") as HTMLInputElement | null;
    if (!visibilityField)
      return;
    const shouldHideVisibility = mode > 0;
    visibilityField.classList.toggle("hidden", shouldHideVisibility);
    if (shouldHideVisibility) {
      if (visibilityToggle)
        visibilityToggle.checked = false;
      this._form?.controls.isVisible.setValue(false, false);
    }
    else {
      const iaValue = this._iaVisibilityInitialized ? this._iaVisibilityPreference : true;
      if (visibilityToggle)
        visibilityToggle.checked = iaValue;
      this._form?.controls.isVisible.setValue(iaValue, false);
      this._iaVisibilityInitialized = true;
    }
  }

  afterInit(): void {
    this._form = new Form("newMatchForm", {
      name: new FormControl<string>(NameGenerator.generatePongName(), [Validators.length(3, 100)]),
      points: new FormControl<number>(10, [Validators.minMax(2, 100)]),
      isVisible: new FormControl<boolean>(true),
      mode: new FormControl<PlayerTypeValue>(PlayerType.ONLINE, [Validators.minMax(0, 2)])
    });

    const modeSelect = document.getElementById("modeSelect") as HTMLSelectElement | null;
    const visibilityToggle = document.getElementById("visibilityToggle") as HTMLInputElement | null;
    if (visibilityToggle) {
      visibilityToggle.addEventListener("change", () => {
        if (modeSelect && Number(modeSelect.value) === 0)
          this._iaVisibilityPreference = visibilityToggle.checked;
      });
    }

    if (modeSelect) {
      this.updateVisibilityToggle(Number(modeSelect.value));
      modeSelect.addEventListener("change", () => this.updateVisibilityToggle(Number(modeSelect.value)));
    }

    this._form.submit = (val) => {
      this._service.newMatch(val)
        .then(({token}) => this.router?.redirectByPath(`/play/${token}`))
        .catch(err => Alert.error("error", JSON.stringify(err)));
    } 
  }
}