"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auditLogService } from "@/lib/services/modern/audit-log.service";
import { useAuth } from "@/hooks/useAuth";

export function AuditLogTest() {
  const [courseId, setCourseId] = useState(
    "3395b5f6-ebf2-4f45-a7d5-b64ea155d37a"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const testAPI = async () => {
    if (!courseId) {
      setError("Vui lòng nhập Course ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {

      const data = await auditLogService.getCourseAuditLog(courseId);
      setResult(data);
    } catch (err: any) {
      console.error("❌ API Error:", err);
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Test Audit Log API</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Label htmlFor="courseId">Course ID:</Label>
          <Input
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Nhập Course ID..."
            className="flex-1"
          />
          <Button onClick={testAPI} disabled={loading}>
            {loading ? "Testing..." : "Test API"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-800">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-800">Success:</h3>
            <pre className="text-sm text-green-600 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800">User Info:</h3>
          <p className="text-blue-600">
            Role: {user?.role || "Không có"} | Can View:{" "}
            {user?.role === "ADMIN" || user?.role === "HR" ? "Yes" : "No"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
