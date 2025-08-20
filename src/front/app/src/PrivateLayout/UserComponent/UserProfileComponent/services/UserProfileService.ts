import type UserProfile from "../models/UserProfile";

export default class UserProfileService {
  private readonly BASE = "http://localhost:8080/user";
  private readonly PROFILE_ENDPOINT = "/";

  async getUserProfile(userName: string): Promise<UserProfile | undefined> {
    try {
      const response = await fetch(this.BASE + this.PROFILE_ENDPOINT + userName);
      if (!response.ok) return undefined;
  
      const data: UserProfile = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return undefined;
    }
  }
}