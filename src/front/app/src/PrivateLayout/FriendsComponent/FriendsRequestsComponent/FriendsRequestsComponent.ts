import AmethComponent from "../../../framework/AmethComponent";
import { DOMHelper } from "../../../utils/DOMHelper";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileComponent from "../../UserComponent/UserProfileComponent/UserProfileComponent";
import { FriendsService } from "../services/FriendsService";

export default class FriendsRequestsComponent extends AmethComponent {
  template = () => import("./FriendsRequestsComponent.html?raw");
private friendsService: FriendsService;
  private container!: HTMLDivElement;

  constructor() {
    super();
    this.friendsService = new FriendsService();
  }

  afterInit() {
    this.container = document.getElementById("friendsListContainer")! as HTMLDivElement;
    this.refresh();
  }
  
  clearView() {
    this.container.innerHTML = "Still no requests :(";
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
    this.friendsService.getRequests().then(val => {
      this.fillView(val);
    }).catch(val => alert("Some error occurred: " + JSON.stringify(val)));
  }
}
