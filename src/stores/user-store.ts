
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock';
import Cookies from 'js-cookie';

interface UserStore {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  fetchUsers: () => Promise<void>;
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

// Custom storage object sử dụng js-cookie
const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name);
    return value === undefined ? null : value;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, {
      expires: 7, // Cookie hết hạn sau 7 ngày
      sameSite: 'strict', // Chính sách SameSite
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở môi trường production
    });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name);
  },
};

// Hàm chuyển đổi các trường date từ string sang Date object khi tải từ cookie
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
  persist( // Sử dụng middleware persist của Zustand
    (set, get) => ({
      users: mockUsers.map(user => ({ 
        ...user,
        startWork: user.startWork ? new Date(user.startWork) : undefined,
        endWork: user.endWork ? new Date(user.endWork) : undefined,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        modifiedAt: user.modifiedAt ? new Date(user.modifiedAt) : new Date(),
      })),
      _hasHydrated: false, // Flag để theo dõi trạng thái hydration
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
      fetchUsers: async () => {
        // Dữ liệu đã được quản lý bằng cookie, không cần gọi API
      },
      setUsers: (users) => {
        set({ users: deserializeDates(users) }); // Chuyển đổi date khi set
      },
      addUser: (user) => {
        set((state) => {
          const newUserWithDate = { // Đảm bảo user mới cũng có date object
            ...user,
            createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
            modifiedAt: user.modifiedAt ? new Date(user.modifiedAt) : new Date(),
            startWork: user.startWork ? new Date(user.startWork) : undefined,
            endWork: user.endWork ? new Date(user.endWork) : undefined,
          };
          return { users: [...state.users, newUserWithDate] };
        });
      },
      updateUser: (userId, userData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  ...userData,
                  modifiedAt: new Date(),
                  // Đảm bảo các ngày trong userData cũng được chuyển đổi nếu chúng là chuỗi
                  startWork: userData.startWork ? new Date(userData.startWork) : user.startWork,
                  endWork: userData.endWork ? new Date(userData.endWork) : user.endWork,
                }
              : user
          ),
        }));
      },
      deleteUser: (userId) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== userId),
        }));
      },
    }),
    {
      name: 'becamex-user-list-storage', // Tên cookie
      storage: createJSONStorage(() => cookieStorage), // Sử dụng cookieStorage tùy chỉnh
      onRehydrateStorage: () => (state, error) => { // Callback khi tải lại từ storage
        if (error) {
          console.error('Lỗi khi tải dữ liệu người dùng từ cookie:', error);
        } else if (state) {
          state.users = deserializeDates(state.users); // Chuyển đổi date
          state.setHasHydrated(true); // Đánh dấu đã hydrate
        }
      },
      // Partialize để chỉ lưu trữ mảng users
      partialize: (state) => ({ users: state.users }),
    }
  )
);


// Để đảm bảo _hasHydrated được đặt sau khi tải ban đầu từ cookie:
if (typeof window !== 'undefined') { // Chỉ chạy ở client
  useUserStore.persist.rehydrate(); // Kích hoạt rehydration
}

