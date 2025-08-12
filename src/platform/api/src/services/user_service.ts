import { User } from '../entities/user_entity.js';
import type { UserDto } from './dtos/user_dto.js';
import { UserRepository } from '../repositories/user_repository.js';

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