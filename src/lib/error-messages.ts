export interface ErrorMessage {
  title: string;
  message: string;
  variant?: "default" | "destructive" | "success";
}

export const errorMessages: Record<string, ErrorMessage> = {
  // Course errors
  COURSE001: {
    title: "Lỗi khóa học",
    message: "Khóa học đã tồn tại",
    variant: "destructive",
  },
  COURSE002: {
    title: "Lỗi xóa khóa học",
    message: "Không thể xóa khóa học đang diễn ra",
    variant: "destructive",
  },
  COURSE003: {
    title: "Lỗi quyền hạn",
    message: "Bạn không có quyền thực hiện hành động này",
    variant: "destructive",
  },

  // Form validation
  FORM001: {
    title: "Lỗi biểu mẫu",
    message: "Vui lòng điền đầy đủ thông tin",
    variant: "destructive",
  },
  SUCCESS001: {
    title: "Thành công",
    message: "Thao tác thành công",
    variant: "success",
  },

  // File upload errors
  FILE001: {
    title: "Lỗi tải tệp lên",
    message: "Định dạng file không hợp lệ. Chỉ chấp nhận ảnh hoặc PDF.",
    variant: "destructive",
  },
  FILE002: {
    title: "Lỗi tải tệp lên",
    message: "File quá lớn. Kích thước tối đa là 5MB.",
    variant: "destructive",
  },
  FILE003: {
    title: "Lỗi tải tệp lên",
    message: "Không thể tải file lên. Vui lòng thử lại.",
    variant: "destructive",
  },
};
