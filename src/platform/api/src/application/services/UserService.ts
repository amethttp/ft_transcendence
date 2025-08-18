import { User } from "../../domain/entities/User";
import { Auth } from "../../domain/entities/Auth";
import type { UserDto } from "../models/UserDto";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Password } from "../../domain/entities/Password";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user: User | null = await this.userRepository.findByUsername(username);

    if (user === null)
      throw 'User not found';

    return user;
  }

  async createUser(userData: UserDto): Promise<User | null> {
    // validate INFO logic etc...

    const existingMail = await this.userRepository.findByEmail(userData.email);
    const existingUser = await this.userRepository.findByUsername(userData.username);
    if (existingMail || existingUser) throw "User and/or email already exists";

    return this.userRepository.create(userData);
  }

  async test(method: string, id: number): Promise<string> {
    const createRequest = {
      email: "test" + id + "@testemail.com",
      username: "testUser" + id,
      avatarUrl: "testAvatar" + id
    } as UserDto;

    const updateRequest = {
      email: "test@testemail.com",
      username: "newusername",
      avatarUrl: "newavatar"
    } as UserDto;

    const userPass: Password = {
      id: 1,
      hash: "1234",
      updateTime: new Date(),
    };

    const userAuth: Auth = {
      id: 1,
      lastLogin: new Date(),
      password: userPass,
    };

    const createUserData: Partial<User> = {
      ...createRequest,
      auth: userAuth
    };

    const updateUserData: Partial<User> = {
      ...updateRequest,
      auth: userAuth
    };

    switch (method) {
      case 'create':
        const created = await this.userRepository.create(createUserData);
        console.log(created);
        return JSON.stringify(created);
      case 'find':
        const findId = await this.userRepository.findById(id);
        console.log(findId);
        return JSON.stringify(findId);
      case 'findAll':
        const findAll = await this.userRepository.findAll();
        console.log(findAll);
        return JSON.stringify(findAll);
      case 'delete':
        const deleted = await this.userRepository.delete(id);
        console.log(deleted);
        return JSON.stringify(deleted);
      case 'update':
        const updated = await this.userRepository.update(id, updateUserData);
        console.log(updated);
        return JSON.stringify(updated);
    
      default:
        return ("Method unknown");
    }
  }
}
