import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { User, CreateUserRequest } from "@/lib/types/user.types";
import { mockUsers } from "@/lib/mock";
import Cookies from "js-cookie";
import { usersService } from "@/lib/services";
import { API_CONFIG } from "@/lib/config";

// Store này hiện tại chủ yếu để giữ trạng thái của user đã đăng nhập
// và cung cấp quản lý trạng thái đơn giản qua các component.
// Dữ liệu cụ thể theo trang như danh sách users nên được xử lý bởi TanStack Query trong chính các component.

interface UserStore {
  users: User[]; // Có thể được sử dụng như cache đơn giản hoặc cho các trường hợp không phân trang
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  // fetchUsers đã được loại bỏ để ngăn việc fetch không phụ thuộc vào component. Việc fetch giờ được thực hiện trong components.
  addUser: (user: User) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name);
    return value === undefined ? null : value;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 7, sameSite: "strict" });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

const deserializeDates = (users: User[]): User[] => {
  return users.map((user) => ({
    ...user,
    startWork: user.startWork ? new Date(user.startWork) : undefined,
    endWork: user.endWork ? new Date(user.endWork) : undefined,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    modifiedAt: user.modifiedAt ? new Date(user.modifiedAt) : new Date(),
  }));
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: mockUsers, // Khởi tạo với dữ liệu mock như fallback
      isLoading: false, // Mặc định là false, các component sẽ quản lý trạng thái loading của riêng chúng
      error: null,
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      setUsers: (users) => set({ users: deserializeDates(users) }),

      addUser: (user) => {
        set((state) => ({ users: [...state.users, user] }));
      },

      updateUser: (userId, userData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? deserializeDates([{ ...user, ...userData }])[0]
              : user
          ),
        }));
      },

      deleteUser: (userId: string) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }));
      },
    }),
    {
      name: "becamex-user-list-storage",
      storage: createJSONStorage(() => cookieStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => ({ users: state.users }),
    }
  )
);

if (typeof window !== "undefined") {
  useUserStore.persist.rehydrate();
}
