"use client";
import dynamic from "next/dynamic";

const UserList = dynamic(() => import("@/components/users/UserList"), {
  ssr: false,
});

export default function UsersPage() {
  return (
    <main style={{ padding: 32 }}>
      <UserList />
    </main>
  );
}
