import { User } from "../../domain/entities/User";
import { Auth } from "../../domain/entities/Auth";
import type { UserDto } from "../models/UserDto";
import { UserRepository } from "../../infrastructure/repositories/sqlite/UserRepository";

export class UserService {
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: UserDto): Promise<User | null> {
    // validate INFO logic etc...

    // const existingMail = await this.userRepository.findByEmail(userData.email);
    // const existingUser = await this.userRepository.findByUsername(
    //   userData.username,
    // );
    // if (existingMail || existingUser) throw "User and/or email already exists";

    return this.userRepository.create(userData);
  }

  async test(): Promise<string> {
    const createRequest = {
      email: "test@testemail.com",
      username: "testUser",
      avatarUrl: "testAvatar"
    } as UserDto;

    const updateRequest = {
      email: "test@testemail.com",
      username: "newusername",
      avatarUrl: "newavatar"
    } as UserDto;

    const userAuth: Auth = {
      id: 1,
      lastLogin: new Date("today"),
      // password: "1234"
    };

    const createUserData: Partial<User> = {
      ...createRequest,
      auth: userAuth
    };

    const updateUserData: Partial<User> = {
      ...updateRequest,
      auth: userAuth
    };

    const created = await this.userRepository.create(createUserData);
    const deleted = await this.userRepository.delete(created ? created.id : 1);
    const updated = await this.userRepository.update(created ? created.id : 1, updateUserData);
    const findId = await this.userRepository.findById(1);
    const findAll = await this.userRepository.findAll();
    
    console.log("CREATED:", created ? created.id : null);
    console.log("DELETED:", deleted);
    console.log("UPDATED:", updated);
    console.log("FIND ID:", findId);
    console.log("FIND ALL:", findAll);

    return "OKKKKK";
  }
}
