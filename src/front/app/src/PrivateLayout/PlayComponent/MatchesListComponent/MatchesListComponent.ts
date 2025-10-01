import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class MatchesListComponent extends AmethComponent {
  template = () => import("./MatchesListComponent.html?raw");
  private _form!: Form<{ token: string }>;

  afterInit(): void {
    this._form = new Form("matchCodeListForm", {
      token: new FormControl<string>("", [Validators.length(1, 30)])
    });

    this._form.submit = ({token}) => {
      this.router?.navigateByPath(`/play/${token}`);
    };
  }
}