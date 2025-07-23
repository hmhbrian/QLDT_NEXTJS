
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { User, CreateUserRequest } from "@/lib/types/user.types";
import { mockUsers } from "@/lib/mock";
import Cookies from "js-cookie";
import { usersService } from "@/lib/services";
import { API_CONFIG } from "@/lib/config";

interface UserStore {
  users: User[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
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
    startWork: user.startWork ? user.startWork : undefined,
    endWork: user.endWork ? user.endWork : undefined,
    createdAt: user.createdAt ? user.createdAt : new Date().toISOString(),
    modifiedAt: user.modifiedAt ? user.modifiedAt : new Date().toISOString(),
  }));
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: mockUsers, 
      isLoading: false, 
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
