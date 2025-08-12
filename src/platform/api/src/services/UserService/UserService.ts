import { User } from "../../entities/User";
import type { UserDto } from "./models/UserDto";
import { UserRepository } from "../../repositories/UserRepository";

export class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: UserDto): Promise<User> {
    // validate INFO logic etc...

    // const existingMail = await this.userRepository.findByEmail(userData.email);
    // const existingUser = await this.userRepository.findByUsername(
    //   userData.username,
    // );
    // if (existingMail || existingUser) throw "User and/or email already exists";

    return this.userRepository.create(userData);
  }
}
