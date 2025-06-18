import { fetchUsers } from "@/lib/api/users";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

export default function UserList() {
  const { user, loadingAuth: loadingAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !loadingAuth) {
      window.location.href = "/login";
      return;
    }
    if (user) {
      fetchUsers()
        .then((res) => {
          console.log("UserList fetchUsers response:", res);
          setUsers(res.data?.items || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("UserList fetchUsers error:", err);
          setError("Lỗi tải danh sách người dùng");
          setLoading(false);
        });
    }
  }, [user, loadingAuth]);

  if (loadingAuth) return <div>Đang kiểm tra đăng nhập...</div>;
  if (!user) return null;
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;

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
