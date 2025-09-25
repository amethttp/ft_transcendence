import AmethComponent from "../../framework/AmethComponent";
import { Form } from "../../framework/Form/Form";
import { FormControl } from "../../framework/Form/FormGroup/FormControl/FormControl";

export default class ContextBarComponent extends AmethComponent {
  template = () => import("./ContextBarComponent.html?raw");
  private _form!: Form<{search: string}>;
  
  afterInit() {
    this._form = new Form("ContextBarComponentSearchForm",
      {search: new FormControl<string>("")}
    );

    this._form.submit = ({search}) => {
      this.router?.navigateByUrl("/search");
    }
  }
}