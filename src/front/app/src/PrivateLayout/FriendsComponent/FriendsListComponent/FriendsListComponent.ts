import AmethComponent from "../../../framework/AmethComponent";
import { Context } from "../../../framework/Context/Context";
import { DOMHelper } from "../../../utils/DOMHelper";
import type { FriendsStatus } from "../../models/FriendsStatus";
import type UserProfile from "../../UserComponent/models/UserProfile";
import type UserProfileComponent from "../../UserComponent/UserProfileComponent/UserProfileComponent";
import UserProfileActionsComponent from "../../UserComponent/UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";

export default class FriendsListComponent<Component extends UserProfileComponent = UserProfileActionsComponent> extends AmethComponent {
  template = () => import("./FriendsListComponent.html?raw");
  protected _container!: HTMLDivElement;
  protected userProfiles: Component[];
  fillView: (friends: UserProfile[]) => Promise<void>;
  updateStatuses: (statuses: FriendsStatus) => void;

  constructor() {
    super();
    this.userProfiles = [];
    this.fillView = this._fillView.bind(this);
    this.updateStatuses = this._updateStatuses.bind(this);
  }

  get profiles(): Component[] {
    return this.userProfiles;
  }

  async afterInit() {
    this._container = this.outlet?.getElementsByClassName("friendsListContainer")[0]! as HTMLDivElement;
    this.listenData();
  }

  protected listenData() {
    Context.friends.on("profile", this.fillView);
    Context.friends.on("status", this.updateStatuses);
  }

  clearView() {
    this._container.innerHTML = "Still no friends :(";
  }

  private deleteProfiles(list: UserProfile[]) {
    this.userProfiles = this.userProfiles.filter(component => {
      if (!list.find(friend => friend.username === component.userProfile.username)) {
        component.destroy();
        component.outlet?.remove();
        return false;
      }
      else
        return true;
    });
  }

  protected deleteUnused(friends: UserProfile[]) {
    this.deleteProfiles(friends);
    if (friends.length === 0)
      this.clearView();
    else if (this.userProfiles.length === 0)
      this._container.innerHTML = '';
  }

  async _fillView(friends: UserProfile[]) {
    this.deleteUnused(friends);
    for (const friend of friends) {
      let profile = this.userProfiles.find(profile => profile.userProfile.username === friend.username);
      if (profile)
        profile.update(friend);
      else
        this.userProfiles.push(await this.createProfile(friend));
    }
  }

  async createProfile(friend: UserProfile): Promise<Component> {
    let template = `
            <a class="" href="/${friend.username}"></a>
          `;
    const elem = DOMHelper.createElementFromHTML(template);
    this._container.appendChild(elem);
    const profile = new UserProfileActionsComponent(friend) as unknown as Component;
    await profile.init(elem.id, this.router);
    profile.on("change", () => this.router?.refresh());
    profile.afterInit();
    await (profile as unknown as UserProfileActionsComponent).hideLoggedUserActions();
    return profile;
  }

  protected _updateStatuses(statuses: FriendsStatus) {
    for (const profile of this.userProfiles)
      profile.setOnlineStatus(statuses[profile.userProfile.username]);
  }

  protected stopListenData() {
    Context.friends.off("profile", this.fillView);
    Context.friends.off("status", this.updateStatuses);
  }

  async destroy() {
    this.stopListenData();
    this.deleteUnused([]);
    super.destroy();
  }
}
