// Mock Login Credentials
export const mockLoginCredentials = {
  ADMIN: {
    email: "Admin@becamex.com",
    password: "123123",
  },
  hr: {
    email: "hr@becamex.com",
    password: "123123",
  },
  HOCVIEN: {
    email: "HOCVIEN@becamex.com",
    password: "123123",
  },
};

// Mock Login Response
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

// Mock Login API Function
export const mockLoginAPI = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check credentials
  if (
    email === mockLoginCredentials.ADMIN.email &&
    password === mockLoginCredentials.ADMIN.password
  ) {
    return {
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: "1",
        fullName: "Quản trị viên",
        email: mockLoginCredentials.ADMIN.email,
        role: "ADMIN",
      },
    };
  }

  if (
    email === mockLoginCredentials.hr.email &&
    password === mockLoginCredentials.hr.password
  ) {
    return {
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: "2",
        fullName: "Quản lý nhân sự",
        email: mockLoginCredentials.hr.email,
        role: "HR",
      },
    };
  }

  if (
    email === mockLoginCredentials.HOCVIEN.email &&
    password === mockLoginCredentials.HOCVIEN.password
  ) {
    return {
      success: true,
      message: "Đăng nhập thành công",
      user: {
        id: "3",
        fullName: "Nguyễn Văn A",
        email: mockLoginCredentials.HOCVIEN.email,
        role: "HOCVIEN",
      },
    };
  }

  return {
    success: false,
    message: "Email hoặc mật khẩu không chính xác",
  };
};
