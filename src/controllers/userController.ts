import { Request, Response } from "express";
import UserService from "../services/userService";
import { CreateUserDTO, UpdateUserDTO } from "./../dtos/userDto";
import { AuthRequest } from "../middlewares/authUserMiddlewares";
import { ApiResponse } from "../common/ApiResponse";

class UserController {
  async createUser(req: Request, res: Response) {
    const createUserDTO: CreateUserDTO = req.body;
    const user = await UserService.createUser(createUserDTO);
    return ApiResponse.created(res, "회원가입이 완료되었습니다.", user);
  }

  async sendVerificationCode(req: Request, res: Response) {
    const { email } = req.body;
    await UserService.sendVerificationCode(email);
    return ApiResponse.success(res, "인증번호가 이메일로 전송되었습니다.");
  }

  async verifyEmail(req: Request, res: Response) {
    const { email, code } = req.body;
    await UserService.verifyEmail(email, code);
    return ApiResponse.success(res, "이메일 인증이 완료되었습니다.");
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { role, token, refreshToken } = await UserService.login(email, password);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    });
    return ApiResponse.success(res, "로그인 되었습니다.", { role });
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return ApiResponse.success(res, "로그아웃 되었습니다.");
  }

  async userInfo(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const user = await UserService.userInfo(userId);
    return ApiResponse.success(res, "유저 정보가 조회되었습니다.", user);
  }

  async getUser(req: AuthRequest, res: Response) {
    const userId: string = req.user._id;
    const user = await UserService.getUser(userId);
    return ApiResponse.success(res, "회원 정보가 조회되었습니다.", user);
  }

  async updateUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const updateUserDTO: UpdateUserDTO = req.body;
    const image = req.file;
    const user = await UserService.updateUser(userId, updateUserDTO, image);
    return ApiResponse.success(res, "회원 정보가 수정되었습니다.", user);
  }

  async deleteUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { password } = req.body;
    await UserService.deleteUser(userId, password);
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return ApiResponse.success(res, "회원 탈퇴가 완료되었습니다.");
  }
}

export default new UserController();
