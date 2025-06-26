// Test import để đảm bảo không có lỗi
import { API_CONFIG } from "@/lib/config";
import { usersService } from "@/lib/services";

console.log("✅ Imports are working correctly!");
console.log("API_CONFIG:", API_CONFIG.useApi);
console.log("UsersService:", typeof usersService.createUser);

export default function TestPage() {
  return <div>Test imports - check console</div>;
}
