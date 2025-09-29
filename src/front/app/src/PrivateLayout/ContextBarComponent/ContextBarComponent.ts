import AmethComponent from "../../framework/AmethComponent";
import { Form } from "../../framework/Form/Form";
import { FormControl } from "../../framework/Form/FormGroup/FormControl/FormControl";
import { SearchHelper } from "../SearchComponent/helpers/SearchHelper";

export default class ContextBarComponent extends AmethComponent {
  template = () => import("./ContextBarComponent.html?raw");
  private _form!: Form<{search_query: string}>;
  
  afterInit() {
    const query = SearchHelper.getQuery();
    this._form = new Form("ContextBarComponentSearchForm",
      {search_query: new FormControl<string>(query || "")}
    );

    this._form.submit = ({search_query}) => {
      this.router?.navigateByPath(`/search?q=${encodeURIComponent(search_query)}`);
    }
  }
}