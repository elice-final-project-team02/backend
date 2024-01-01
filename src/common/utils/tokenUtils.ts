import "dotenv/config";
import jwt from "jsonwebtoken";
import { UserModel, IUser } from "../../models/userModel";
import NotFoundError from "../error/NotFoundError";

const SECRET_KEY = process.env.SECRET_KEY as string;

// 액세스토큰 생성
export function generateToken(user: IUser): string {
  const payload = {
    userId: user._id,
    email: user.email,
  };
  const token = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "1h",
  });
  return token;
}

// 리프레시토큰 생성
export function generateRefreshToken(user: IUser): string {
  const payload = {
    userId: user._id,
  };
  const refreshToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: "14d",
  });
  return refreshToken;
}

// 토큰 검증
export async function findByToken(token: string): Promise<IUser | null> {
  try {
    const decode = jwt.verify(token, SECRET_KEY) as { userId: string };
    const foundUser = await UserModel.findOne({ _id: decode.userId });
    return foundUser;
  } catch (err) {
    if (err.message === "jwt expired") {
      return null;
    }
  }
}
