import AmethComponent from "../../../framework/AmethComponent";
import { Context } from "../../../framework/Context/Context";
import { DOMHelper } from "../../../utils/DOMHelper";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileComponent from "../../UserComponent/UserProfileComponent/UserProfileComponent";

export default class FriendsListComponent extends AmethComponent {
  template = () => import("./FriendsListComponent.html?raw");
  private container!: HTMLDivElement;
  

  constructor() {
    super();
  }

  afterInit() {
    this.container = this.outlet?.getElementsByClassName("friendsListContainer")[0]! as HTMLDivElement;
    Context.friends.on("profile", this.fillView);
    this.refresh();
  }
  
  clearView() {
    this.container.innerHTML = "Still no friends :(";
  }

  fillView = async (friends: UserProfile[]) => {
    if (friends.length > 0)
      this.container.innerHTML = "";
    for (const friend of friends) {
      const template = `
        <a class="" href="/${friend.username}"></a>
      `;
      const elem = DOMHelper.createElementFromHTML(template);
      this.container.appendChild(elem);
      const profile = new UserProfileComponent(friend);
      await profile.init(elem.id, this.router);
      profile.afterInit();
    }
  }

  async refresh() {
    this.clearView();
    Context.friends.get().then(val => {
      this.fillView(val);
    }).catch(val => alert("Some error occurred: " + JSON.stringify(val)));
  }

  async destroy() {
    Context.friends.off("profile", this.fillView);
  }
}
