import AmethComponent from "../../../framework/AmethComponent";
import { DOMHelper } from "../../../utils/DOMHelper";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileComponent from "../../UserComponent/UserProfileComponent/UserProfileComponent";
import { FriendsService } from "../services/FriendsService";

export default class FriendsListComponent extends AmethComponent {
  template = () => import("./FriendsListComponent.html?raw");
  private friendsService: FriendsService;
  private container!: HTMLDivElement;

  constructor() {
    super();
    this.friendsService = new FriendsService();
  }

  afterInit() {
    this.container = this.outlet?.getElementsByClassName("friendsListContainer")[0]! as HTMLDivElement;
    this.refresh();
  }
  
  clearView() {
    this.container.innerHTML = "Still no friends :(";
  }

  async fillView(friends: UserProfile[]) {
    if (friends.length > 0)
      this.container.innerHTML = "";
    for (const friend of friends) {
      const template = `
      <div class=""></div>
      `;
      const elem = DOMHelper.createElementFromHTML(template);
      this.container.appendChild(elem);
      const profile = new UserProfileComponent(friend);
      await profile.init(elem.id, this.router);
      profile.afterInit();
      elem.click = () => this.refresh();
      console.log(friend);
    }
  }

  async refresh() {
    this.clearView();
    this.friendsService.getAll().then(val => {
      this.fillView(val);
    }).catch(val => alert("Some error occurred: " + JSON.stringify(val)));
  }
}
