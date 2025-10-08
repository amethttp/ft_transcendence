import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type { Router } from "../../../framework/Router/Router";
import MatchesListComponent from "./MatchesListComponent/MatchesListComponent";

export default class MatchesComponent extends AmethComponent {
  template = () => import("./MatchesComponent.html?raw");
  private _form!: Form<{ token: string }>;
  private _matchesListComponent: MatchesListComponent;

  constructor() {
    super();
    this._matchesListComponent = new MatchesListComponent();
  }

  async init(selector: string, router?: Router) {
    await super.init(selector, router);
    await this._matchesListComponent.init("MatchesComponentList", this.router);
  }

  afterInit(): void {
    this._form = new Form("matchCodeListForm", {
      token: new FormControl<string>("", [Validators.length(1, 30)])
    });
    this._form.submit = ({ token }) => {
      this.router?.navigateByPath(`/play/${token}`);
    };

    this._matchesListComponent.afterInit();
  }

  async refresh() {
    await this._matchesListComponent.refresh();
  }
}