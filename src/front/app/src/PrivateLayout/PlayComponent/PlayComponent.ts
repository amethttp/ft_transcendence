import AmethComponent from "../../framework/AmethComponent";
import { Form } from "../../framework/Form/Form";
import { FormControl } from "../../framework/Form/FormGroup/FormControl/FormControl";
import { TabsHelper } from "../../framework/Tabs/TabsHelper";

export default class PlayComponent extends AmethComponent {
  template = () => import("./PlayComponent.html?raw");
  private _tabs: HTMLElement | null;
  private _codeForm!: Form<{ token: string }>;

  constructor() {
    super();
    this._tabs = null;
  }

  afterInit() {
    this._tabs = document.getElementById("PlayComponentTabs");
    this._checkTabs();
    this._codeForm = new Form("matchCodeListForm", {
      token: new FormControl<string>("")
    });
    this._codeForm.submit = ({ token }) => {
      if (token) {
        if (this.router?.currentPath.fullPath.includes("/tournaments"))
          this.router?.navigateByPath(`/play/tournament/${encodeURIComponent(token)}`);
        else
          this.router?.navigateByPath(`/play/${encodeURIComponent(token)}`);
      }
    };
  }

  async refresh() {
    this._checkTabs();
  }

  _checkTabs() {
    if (this._tabs)
      TabsHelper.checkTabs(this._tabs, this.router?.currentPath.fullPath);
  }
}
