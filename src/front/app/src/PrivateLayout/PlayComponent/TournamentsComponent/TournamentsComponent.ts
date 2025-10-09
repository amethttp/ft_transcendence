import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type { Router } from "../../../framework/Router/Router";
import TournamentsListComponent from "./TournamentsListComponent/TournamentsListComponent";

export default class TournamentsComponent extends AmethComponent {
  template = () => import("./TournamentsComponent.html?raw");
  private _form!: Form<{ token: string }>;
  private _listComponent: TournamentsListComponent;

  constructor() {
    super();
    this._listComponent = new TournamentsListComponent();
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
    await this._listComponent.init("tournamentsList", router);
  }

  afterInit(): void {
    this._form = new Form("tournamentCodeListForm", {
      token: new FormControl<string>("", [Validators.length(1, 30)])
    });

    this._form.submit = ({ token }) => {
      this.router?.navigateByPath(`/play/tournament/${token}`);
    };

    this._listComponent.afterInit();
  }

  refresh(): void {
    this._listComponent.refresh();
  }

  async destroy() {
    await this._listComponent.destroy();
    await super.destroy();
  }
}