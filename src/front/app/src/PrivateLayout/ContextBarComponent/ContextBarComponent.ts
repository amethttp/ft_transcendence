import AmethComponent from "../../framework/AmethComponent";
import { Form } from "../../framework/Form/Form";
import { FormControl } from "../../framework/Form/FormGroup/FormControl/FormControl";
import { SearchHelper } from "../SearchComponent/helpers/SearchHelper";

export default class ContextBarComponent extends AmethComponent {
  template = () => import("./ContextBarComponent.html?raw");
  private _form!: Form<{search: string}>;
  
  afterInit() {
    const query = SearchHelper.getQuery();
    this._form = new Form("ContextBarComponentSearchForm",
      {search: new FormControl<string>(query || "")}
    );

    this._form.submit = ({search}) => {
      this.router?.navigateByPath(`/search?q=${encodeURIComponent(search)}`);
    }
  }

  refresh(): void {
    // const input = document.getElementById("ContextBarComponentSearchInput")! as HTMLInputElement;
    // input.value = SearchHelper.getQuery() || "";
    // input.dispatchEvent(new InputEvent("input"));
  }
}