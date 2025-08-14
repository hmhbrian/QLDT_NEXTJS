
import { usersService } from "@/lib/services";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { ErrorHandler } from "@/lib/utils/error.utils";
import type { User } from "@/lib/types/user.types";
import { mapUserApiToUi } from "@/lib/mappers/user.mapper";

export default function UserList() {
  const { user, loadingAuth } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !loadingAuth) {
      window.location.href = "/login";
      return;
    }
    if (user) {
      usersService
        .getUsersWithPagination({ Page: 1, Limit: 50, SortField: "fullName", SortType: "asc" })
        .then((res) => {
          console.log("UserList fetchUsers response:", res);
          const uiUsers = (res.items || []).map(mapUserApiToUi);
          setUsers(uiUsers); 
          setLoading(false);
        })
        .catch((err) => {
          console.error("UserList fetchUsers error:", err);
          ErrorHandler.handle(err);
          setLoading(false);
        });
    }
  }, [user, loadingAuth]);

  if (loadingAuth) return <div>Đang kiểm tra đăng nhập...</div>;
  if (!user) return null;
  if (loading) return <div>Đang tải...</div>;

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Họ tên</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.fullName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
