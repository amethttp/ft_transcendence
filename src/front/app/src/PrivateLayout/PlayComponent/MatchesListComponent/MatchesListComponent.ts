import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";

export default class MatchesListComponent extends AmethComponent {
  template = () => import("./MatchesListComponent.html?raw");
  private _form!: Form<{ token: string }>;

  afterInit(): void {
    this._form = new Form("matchCodeListForm", {
      token: new FormControl<string>("")
    });

    this._form.submit = ({token}) => {
      if (!token || token === "")
        Alert.error("Invalid match");
      else
      {
        try {
          const url = new URL(token);
          this.router?.navigateByUrl(url);
        } catch (error) {
          this.router?.navigateByPath(`/play/${token}`);
        }
      }
    };
  }
}