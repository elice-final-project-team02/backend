import bcrypt from "bcrypt";

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// 비밀번호 비교
export async function comparePassword(userInputPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(userInputPassword, hashedPassword);
}
