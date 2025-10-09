import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type { Router } from "../../../framework/Router/Router";
import type { NewTournamentRequest } from "./models/NewTournamentRequest";
import RoundsSliderComponent from "./RoundsSliderComponent/RoundsSliderComponent";
import { NewTournamentService } from "./services/NewTournamentService";

export default class NewTournamentComponent extends AmethComponent {
  template = () => import("./NewTournamentComponent.html?raw");
  private _form?: Form<NewTournamentRequest> | null;
  private _service: NewTournamentService;
  private _roundsSlider: RoundsSliderComponent;

  constructor() {
    super();
    this._service = new NewTournamentService();
    this._roundsSlider = new RoundsSliderComponent("Max. Players");
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
    await this._roundsSlider.init("roundsSlider", router);
  }

  afterInit(): void {
    this._roundsSlider.afterInit();
    this._form = new Form("newTournamentForm", {
      // TODO: Generated name
      name: new FormControl<string>("", [Validators.length(3, 100)]),
      points: new FormControl<number>(10, [Validators.minMax(2, 100)]),
      playersAmount: this._roundsSlider.control,
      isVisible: new FormControl<boolean>(true)
    });

    this._form.submit = (val) => {
      this._service.newTournament(val)
        .then(({ token }) => this.router?.redirectByPath(`/play/tournament/${token}`))
        .catch(err => Alert.error("error", JSON.stringify(err)));
    }
  }
}