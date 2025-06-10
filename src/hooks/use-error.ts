'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export type ErrorType = 'error' | 'warning' | 'info';

export interface ErrorMessage {
    type: ErrorType;
    code: string;
    message: string;
    details?: string;
}

// Định nghĩa các mã lỗi và thông báo tương ứng
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
    // Lỗi đăng nhập
    'LOGIN001': {
        type: 'warning',
        code: 'LOGIN001',
        message: 'Email không được để trống',
        details: 'Vui lòng nhập email của bạn'
    },
    'LOGIN002': {
        type: 'warning',
        code: 'LOGIN002',
        message: 'Email không hợp lệ',
        details: 'Vui lòng nhập một địa chỉ email hợp lệ'
    },
    'LOGIN003': {
        type: 'warning',
        code: 'LOGIN003',
        message: 'Mật khẩu không được để trống',
        details: 'Vui lòng nhập mật khẩu của bạn'
    },
    'LOGIN004': {
        type: 'warning',
        code: 'LOGIN004',
        message: 'Mật khẩu quá ngắn',
        details: 'Mật khẩu phải có ít nhất 6 ký tự'
    },
    'LOGIN005': {
        type: 'error',
        code: 'LOGIN005',
        message: 'Đăng nhập thất bại',
        details: 'Email hoặc mật khẩu không chính xác'
    },

    // Lỗi xác thực
    'AUTH001': {
        type: 'error',
        code: 'AUTH001',
        message: 'Email hoặc mật khẩu không chính xác',
        details: 'Vui lòng kiểm tra lại thông tin đăng nhập của bạn'
    },
    'AUTH002': {
        type: 'error',
        code: 'AUTH002',
        message: 'Phiên đăng nhập đã hết hạn',
        details: 'Vui lòng đăng nhập lại để tiếp tục'
    },
    'AUTH003': {
        type: 'error',
        code: 'AUTH003',
        message: 'Không có quyền truy cập',
        details: 'Bạn không có quyền thực hiện hành động này'
    },

    // Lỗi mật khẩu
    'PASSWORD001': {
        type: 'warning',
        code: 'PASSWORD001',
        message: 'Mật khẩu quá ngắn',
        details: 'Mật khẩu phải có ít nhất 6 ký tự'
    },
    'PASSWORD002': {
        type: 'warning',
        code: 'PASSWORD002',
        message: 'Mật khẩu không đủ mạnh',
        details: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'
    },
    'PASSWORD003': {
        type: 'warning',
        code: 'PASSWORD003',
        message: 'Mật khẩu mới trùng với mật khẩu cũ',
        details: 'Vui lòng chọn một mật khẩu khác'
    },
    'PASSWORD004': {
        type: 'error',
        code: 'PASSWORD004',
        message: 'Không thể thay đổi mật khẩu',
        details: 'Đã xảy ra lỗi khi thay đổi mật khẩu. Vui lòng thử lại'
    },

    // Lỗi form
    'FORM001': {
        type: 'warning',
        code: 'FORM001',
        message: 'Vui lòng điền đầy đủ thông tin',
        details: 'Các trường bắt buộc không được để trống'
    },
    'FORM002': {
        type: 'warning',
        code: 'FORM002',
        message: 'Email không hợp lệ',
        details: 'Vui lòng nhập một địa chỉ email hợp lệ'
    },
    'FORM003': {
        type: 'warning',
        code: 'FORM003',
        message: 'Mật khẩu không đủ mạnh',
        details: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số'
    },

    // Lỗi hệ thống
    'SYS001': {
        type: 'error',
        code: 'SYS001',
        message: 'Lỗi kết nối máy chủ',
        details: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau'
    },
    'SYS002': {
        type: 'error',
        code: 'SYS002',
        message: 'Lỗi hệ thống',
        details: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau'
    },

    // Lỗi dữ liệu
    'DATA001': {
        type: 'error',
        code: 'DATA001',
        message: 'Không thể tải dữ liệu',
        details: 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại'
    },
    'DATA002': {
        type: 'error',
        code: 'DATA002',
        message: 'Không thể lưu dữ liệu',
        details: 'Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại'
    },

    // Thông báo thành công
    'SUCCESS001': {
        type: 'info',
        code: 'SUCCESS001',
        message: 'Thêm người dùng thành công',
        details: 'Người dùng mới đã được thêm vào hệ thống'
    },
    'SUCCESS002': {
        type: 'info',
        code: 'SUCCESS002',
        message: 'Cập nhật thông tin thành công',
        details: 'Thông tin người dùng đã được cập nhật'
    },
    'SUCCESS003': {
        type: 'info',
        code: 'SUCCESS003',
        message: 'Xóa người dùng thành công',
        details: 'Người dùng đã được xóa khỏi hệ thống'
    },
    'SUCCESS004': {
        type: 'info',
        code: 'SUCCESS004',
        message: 'Đổi mật khẩu thành công',
        details: 'Mật khẩu của bạn đã được cập nhật'
    },
    'SUCCESS005': {
        type: 'info',
        code: 'SUCCESS005',
        message: 'Đăng nhập thành công',
        details: 'Chào mừng bạn quay trở lại'
    },
    'SUCCESS006': {
        type: 'info',
        code: 'SUCCESS006',
        message: 'Thao tác khóa học thành công',
        details: 'Khóa học đã được cập nhật trong hệ thống'
    },

    // Lỗi người dùng
    'USER001': {
        type: 'error',
        code: 'USER001',
        message: 'Email đã tồn tại',
        details: 'Vui lòng sử dụng một địa chỉ email khác'
    },
    'USER002': {
        type: 'error',
        code: 'USER002',
        message: 'Không thể xóa tài khoản',
        details: 'Bạn không thể xóa tài khoản đang đăng nhập'
    },
    'USER003': {
        type: 'error',
        code: 'USER003',
        message: 'Không đủ quyền',
        details: 'Bạn không có quyền thực hiện thao tác này'
    }
};

export function useError() {
    const [error, setError] = useState<ErrorMessage | null>(null);
    const { toast } = useToast();
    const [toastInstance, setToastInstance] = useState<{ dismiss: () => void } | null>(null);

    const showError = useCallback((errorCode: string) => {
        const errorMessage = ERROR_MESSAGES[errorCode];
        if (errorMessage) {
            setError(errorMessage);
            toastInstance?.dismiss();

            const instance = toast({
                variant: errorCode.startsWith('SUCCESS') ? 'success' : 'destructive',
                title: errorMessage.message,
                description: errorMessage.details,
                duration: 1500,
            });
            setToastInstance(instance);
        }
    }, [toast, toastInstance]);

    const clearError = useCallback(() => {
        setError(null);
        toastInstance?.dismiss();
    }, [toastInstance]);

    return {
        error,
        showError,
        clearError,
    };
}
