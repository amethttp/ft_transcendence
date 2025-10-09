import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type {  NewTournamentRequest } from "./models/NewTournamentRequest";
import { NewTournamentService } from "./services/NewTournamentService";

export default class NewTournamentComponent extends AmethComponent {
  template = () => import("./NewTournamentComponent.html?raw");
  private _form?: Form<NewTournamentRequest> | null;
  private _service: NewTournamentService;

  constructor() {
    super();
    this._service = new NewTournamentService();
  }

  afterInit(): void {
    this._form = new Form("newTournamentForm", {
      // TODO: Generated name
      name: new FormControl<string>("", [Validators.length(3, 100)]),
      points: new FormControl<number>(10, [Validators.minMax(2, 100)]),
      maxPlayers: new FormControl<number>(4, [Validators.minMax(4, 32)]),
      isVisible: new FormControl<boolean>(true)
    });

    this._form.submit = (val) => {
      this._service.newTournament(val).then(({token}) => this.router?.navigateByPath(`/play/${token}`)).catch(err => Alert.error("error", JSON.stringify(err)));
    }
  }
}