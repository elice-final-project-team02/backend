import redisClient from "../common/utils/redisConfig";
import { UserModel, IUser } from "../models/userModel";
import { RoleModel, IRole } from "../models/roleModel";
import { AreaModel } from "../models/areaModel";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/userDto";
import { sendMail } from "../common/utils/sendMail";
import { hashPassword, comparePassword } from "../common/utils/authUtils";
import BadRequestError from "../common/error/BadRequestError";
import NotFoundError from "../common/error/NotFoundError";

class UserRepository {
  async createUser(userDto: CreateUserDTO): Promise<void> {
    const existingUser = await UserModel.findOne({ email: userDto.email });
    if (existingUser) {
      throw new BadRequestError("이미 가입된 이메일입니다.");
    }

    const role = await RoleModel.create({ role: userDto.role });

    const area = await AreaModel.create({
      region: userDto.region,
      subRegion: userDto.subRegion,
    });

    const hashedPassword = await hashPassword(userDto.password);

    const user = new UserModel({
      role: role._id,
      area: area._id,
      email: userDto.email,
      password: hashedPassword,
      name: userDto.name,
      gender: userDto.gender,
      age: userDto.age,
      phoneNumber: userDto.phoneNumber,
    });

    await user.save();
  }

  async sendVerificationCode(email: string): Promise<void> {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("이미 가입된 이메일입니다.");
    }

    const emailVerificationCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");

    await redisClient.v4.set(email, emailVerificationCode, "EX", 60 * 5);

    const sendMessageInfo = await sendMail(
      email,
      "[쓰담쓰담] 회원가입 이메일 인증 메일입니다.",
      `이메일 인증 코드: ${emailVerificationCode}`,
    );

    if (!sendMessageInfo) {
      throw new NotFoundError("이메일을 보낼 수 없습니다.");
    }
  }

  async verifyEmail(email: string, code: number): Promise<void> {
    const savedCode = await redisClient.v4.get(email);

    if (!savedCode || code !== savedCode) {
      throw new BadRequestError("이메일 인증 코드가 일치하지 않습니다.");
    }
  }

  async login(email: string, password: string): Promise<{ user: IUser; role: IRole }> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    if (user.deletedAt) {
      throw new BadRequestError("탈퇴한 회원입니다.");
    }

    const isMatchPassword = await comparePassword(password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestError("비밀번호가 일치하지 않습니다.");
    }

    const role = await RoleModel.findOne({ _id: user.role });

    return { user, role };
  }

  async userInfo(userId: string) {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }
    const role = await RoleModel.findOne({ _id: user.role });
    const userinfo = {
      role: role,
      age: user.age,
      gender: user.gender,
    };
    return userinfo;
  }

  async getUser(userId: string): Promise<IUser> {
    const user = await UserModel.findOne({ _id: userId });

    const populatedUser = await UserModel.populate(user, { path: "area role" });

    return populatedUser;
  }

  async updateUser(userId: string, updateUserDTO: UpdateUserDTO, image): Promise<IUser> {
    const { password, newPassword, region, subRegion, ...updateFields } = updateUserDTO;

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    if (password && newPassword) {
      const isMatchPassword = await comparePassword(password, user.password);
      if (!isMatchPassword) {
        throw new BadRequestError("비밀번호가 일치하지 않습니다.");
      }
      const hashedNewPassword = await hashPassword(newPassword);
      user.password = hashedNewPassword;
    }

    await AreaModel.findOneAndUpdate({ _id: user.area }, { region, subRegion });

    Object.assign(user, updateFields);

    if (image) {
      user.profileUrl = image.location;
    }

    const updatedUser = await user.save();

    const populatedUser = await UserModel.populate(updatedUser, { path: "area role" });

    return populatedUser;
  }

  async deleteUser(userId: string, password: string): Promise<void> {
    const user = await UserModel.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    const isMatchPassword = await comparePassword(password, user.password);
    if (!isMatchPassword) {
      throw new BadRequestError("비밀번호가 일치하지 않습니다.");
    }

    const krCurrentTime = new Date(Date.now() + 9 * 60 * 60 * 1000);

    await UserModel.findOneAndUpdate({ _id: userId }, { deletedAt: krCurrentTime });
  }
}

export default new UserRepository();
