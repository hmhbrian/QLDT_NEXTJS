// Mock Login Credentials
export const mockLoginCredentials = {
    admin: {
        email: 'admin@becamex.com',
        password: 'admin123'
    },
    hr: {
        email: 'hr@becamex.com',
        password: 'hr123'
    },
    trainee: {
        email: 'trainee@becamex.com',
        password: 'trainee123'
    }
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
export const mockLoginAPI = async (email: string, password: string): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (email === mockLoginCredentials.admin.email && password === mockLoginCredentials.admin.password) {
        return {
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: '1',
                fullName: 'Quản trị viên',
                email: mockLoginCredentials.admin.email,
                role: 'Admin'
            }
        };
    }

    if (email === mockLoginCredentials.hr.email && password === mockLoginCredentials.hr.password) {
        return {
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: '2',
                fullName: 'Quản lý nhân sự',
                email: mockLoginCredentials.hr.email,
                role: 'HR'
            }
        };
    }

    if (email === mockLoginCredentials.trainee.email && password === mockLoginCredentials.trainee.password) {
        return {
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: '3',
                fullName: 'Nguyễn Văn A',
                email: mockLoginCredentials.trainee.email,
                role: 'Trainee'
            }
        };
    }

    return {
        success: false,
        message: 'Email hoặc mật khẩu không chính xác'
    };
}; 