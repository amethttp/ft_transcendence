import { User } from '../../entities/User.js';
import type { UserDto } from './models/UserDto.js';
import { UserRepository } from '../../repositories/UserRepository.js';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(userData: UserDto): Promise<User> {
    // validate INFO logic etc...

    const existingMail = await this.userRepository.findByEmail(userData.email);
    const existingUser = await this.userRepository.findByUsername(userData.username);
    if (existingMail || existingUser)
        throw ('User and/or email already exists');

    const user: Partial<User> = {
      // set necessary fields
      ...userData
    };

    return this.userRepository.create(user);
  }
}