
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { User, CreateUserRequest } from "@/lib/types";
import { mockUsers } from "@/lib/mock";
import Cookies from "js-cookie";
import { usersService } from "@/lib/services";
import { API_CONFIG } from "@/lib/legacy-api/config";

// This store is now primarily for holding the logged-in user's state
// and providing simple state management across components.
// Page-specific data like lists of users should be handled by TanStack Query in the components themselves.

interface UserStore {
  users: User[]; // This can be used as a simple cache or for non-paged scenarios
  isLoading: boolean;
  error: string | null;
  setUsers: (users: User[]) => void;
  // fetchUsers is removed to prevent component-agnostic fetching. Fetching is now done in components.
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
      users: mockUsers, // Initialize with mock data as a fallback
      isLoading: false, // Default to false, components will manage their own loading state
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
