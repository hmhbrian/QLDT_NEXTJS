import type { User } from "../types/user.types";
import { getUserByEmailAndPassword } from "./users";

export interface MockLoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

export const mockLogin = async (
  email: string,
  password: string
): Promise<MockLoginResponse> => {
  const user = getUserByEmailAndPassword(email, password);

  if (user) {
    return {
      success: true,
      message: "Đăng nhập thành công (chế độ offline)",
      user: user,
    };
  }

  return {
    success: false,
    message: "Email hoặc mật khẩu không chính xác (chế độ offline)",
  };
};
