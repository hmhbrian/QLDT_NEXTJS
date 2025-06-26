// Hàm dùng chung: build FormData từ object (chỉ lấy field hợp lệ, bỏ undefined/null)
export function buildFormData(obj: Record<string, any>): FormData {
  const formData = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(key, v.toString());
        }
      });
    } else if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });
  return formData;
}

// Hàm dùng chung: lấy token cho API (ưu tiên becamex-token, fallback accessToken)
export function getApiToken(): string {
  if (typeof window !== "undefined") {
    return (
      localStorage.getItem("becamex-token") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }
  return "";
}
