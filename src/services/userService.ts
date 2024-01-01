// postService.ts
import UserRepository from "../repositories/userRepository";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/userDto";
import { IUser } from "../models/userModel";
import { generateToken, generateRefreshToken } from "../common/utils/tokenUtils";

class UserService {
  async createUser(userDTO: CreateUserDTO): Promise<void> {
    await UserRepository.createUser(userDTO);
  }

  async sendVerificationCode(email: string): Promise<void> {
    return await UserRepository.sendVerificationCode(email);
  }

  async verifyEmail(email: string, code: number): Promise<void> {
    return await UserRepository.verifyEmail(email, code);
  }

  async login(email: string, password: string) {
    const { user, role } = await UserRepository.login(email, password);
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    return { role, token, refreshToken };
  }

  async userInfo(userId: string) {
    return await UserRepository.userInfo(userId);
  }

  async getUser(userId: string): Promise<IUser> {
    return await UserRepository.getUser(userId);
  }

  async updateUser(userId: string, updateUserDTO: UpdateUserDTO, image): Promise<IUser> {
    return await UserRepository.updateUser(userId, updateUserDTO, image);
  }

  async deleteUser(userId: string, password: string): Promise<void> {
    await UserRepository.deleteUser(userId, password);
  }
}

export default new UserService();
