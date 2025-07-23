
import { API_CONFIG } from "@/lib/config";
import { usersService } from "@/lib/services";

/**
 * Test API connection và hiển thị thông tin debug
 */
export async function testApiConnection() {
  console.log("🔧 API Configuration:", {
    baseURL: API_CONFIG.baseURL,
    useApi: API_CONFIG.useApi,
    timeout: API_CONFIG.timeout,
    endpoints: API_CONFIG.endpoints.users,
    corsInfo: "Using Next.js proxy to bypass CORS",
  });

  if (!API_CONFIG.useApi) {
    console.log(
      "⚠️ API is disabled. Set NEXT_PUBLIC_USE_API=true in .env to enable API calls."
    );
    return false;
  }

  try {
    console.log("🚀 Testing API connection through Next.js proxy...");
    const result = await usersService.getUsersWithPagination();
    const users = result.items || [];
    console.log("✅ API connection successful!", { userCount: users.length });
    return true;
  } catch (error: any) {
    console.error("❌ API connection failed:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      errors: error.errors,
      corsNote:
        "If you see CORS errors, restart the dev server with 'npm run dev'",
    });
    return false;
  }
}

// Auto-run test khi import module này
if (typeof window !== "undefined") {
  console.log(
    "🔄 CORS FIX APPLIED - Restart dev server if you see CORS errors!"
  );
  console.log("📝 Run: npm run dev");
  testApiConnection();
}
