import { User } from "../../domain/entities/User";
import { Auth } from "../../domain/entities/Auth";
import type { UserDto } from "../../presentation/models/UserDto";
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
    const userData = {
      email: "test@testemail.com",
      username: "testUser",
      avatarUrl: "testAvatar",
    } as UserDto;

    const userAuth: Auth = {
      id: 1,
      lastLogin: new Date("today"),
      password: "1234",
    };

    const createUserData: Partial<User> = {
      auth: userAuth,
      ...userData,
    };

    const create = await this.userRepository.create(createUserData);
    const findId = await this.userRepository.findById(1);
    const findAll = await this.userRepository.findAll();

    console.log("CREATE:", create ? create.id : null);
    console.log("FIND ID:", findId);
    console.log("FIND ALL:", findAll);
    return "OKKKKK";
  }
}
