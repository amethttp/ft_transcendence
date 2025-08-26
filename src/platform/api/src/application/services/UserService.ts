import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user: User | null = await this.userRepository.findByUsername(username);

    if (user === null)
      throw 'User not found';

    return user;
  }

  async getUserById(id: number): Promise<User> {
    const user: User | null = await this.userRepository.findById(id);

    if (user === null)
      throw 'User not found';

    return user;
  }
}
