// Test import để đảm bảo không có lỗi
import { API_CONFIG } from "@/lib/api/config";
import { usersApiService } from "@/lib/services";

console.log("✅ Imports are working correctly!");
console.log("API_CONFIG:", API_CONFIG.useApi);
console.log("UsersApiService:", typeof usersApiService.createUser);

export default function TestPage() {
  return <div>Test imports - check console</div>;
}
