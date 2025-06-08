import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { mockUsers } from '@/lib/mock';

interface UserStore {
    users: User[];
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (userId: string, userData: Partial<User>) => void;
    deleteUser: (userId: string) => void;
}

// Thử tải danh sách người dùng từ localStorage
const loadInitialUsers = (): User[] => {
    if (typeof window === 'undefined') return mockUsers;
    try {
        const storedUsers = localStorage.getItem('becamex-users');
        if (storedUsers) {
            const parsedUsers = JSON.parse(storedUsers);
            // Chuyển đổi chuỗi ngày tháng thành đối tượng Date
            return parsedUsers.map((user: User) => ({
                ...user,
                startWork: user.startWork ? new Date(user.startWork) : undefined,
                createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                modifiedAt: user.modifiedAt ? new Date(user.modifiedAt) : new Date()
            }));
        }
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng từ localStorage:', error);
    }
    return mockUsers;
};

// Hàm hỗ trợ lưu danh sách người dùng vào localStorage
const saveUsersToStorage = (users: User[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('becamex-users', JSON.stringify(users));
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu người dùng vào localStorage:', error);
    }
};

export const useUserStore = create<UserStore>((set) => ({
    users: loadInitialUsers(),
    setUsers: (users) => {
        set({ users });
        saveUsersToStorage(users);
    },
    addUser: (user) => set((state) => {
        const newUsers = [...state.users, user];
        saveUsersToStorage(newUsers);
        return { users: newUsers };
    }),
    updateUser: (userId, userData) => set((state) => {
        const newUsers = state.users.map((user) =>
            user.id === userId ? { ...user, ...userData, modifiedAt: new Date() } : user
        );
        saveUsersToStorage(newUsers);
        return { users: newUsers };
    }),
    deleteUser: (userId) => set((state) => {
        const newUsers = state.users.filter((user) => user.id !== userId);
        saveUsersToStorage(newUsers);
        return { users: newUsers };
    }),
})); 