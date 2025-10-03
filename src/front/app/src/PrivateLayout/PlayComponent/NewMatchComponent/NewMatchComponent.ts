import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type { NewMatchRequest } from "./models/NewMatchRequest";
import { NewMatchService } from "./services/NewMatchService";

export default class NewMatchComponent extends AmethComponent {
  template = () => import("./NewMatchComponent.html?raw");
  private _form?: Form<NewMatchRequest> | null;
  private _service: NewMatchService;

  constructor() {
    super();
    this._service = new NewMatchService();
  }


  afterInit(): void {
    this._form = new Form("newMatchForm", {
      name: new FormControl<string>("", [Validators.length(3, 100)]),
      points: new FormControl<number>(10, [Validators.minMax(2, 100)]),
      isVisible: new FormControl<boolean>(false)
    });

    this._form.submit = (val) => {
      this._service.newMatch(val).then(({token}) => this.router?.navigateByPath(`/play/${token}`)).catch(err => Alert.error("error", JSON.stringify(err)));
    }
  }
}