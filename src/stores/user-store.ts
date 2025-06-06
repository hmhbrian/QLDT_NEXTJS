import { create } from 'zustand';
import type { User } from '@/lib/types';

interface UserStore {
    users: User[];
    setUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (userId: string, userData: Partial<User>) => void;
    deleteUser: (userId: string) => void;
}

const initialUsers: User[] = [
    {
        id: '1',
        fullName: 'Quản trị viên',
        email: 'admin@becamex.com',
        idCard: 'CMND001',
        phoneNumber: '0901234567',
        role: 'Admin',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date()
    },
    {
        id: '2',
        fullName: 'Quản lý nhân sự',
        email: 'hr@becamex.com',
        idCard: 'CMND002',
        phoneNumber: '0902345678',
        role: 'HR',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date()
    },
    {
        id: '3',
        fullName: 'Nguyễn Văn A',
        email: 'trainee@becamex.com',
        idCard: 'CMND003',
        phoneNumber: '0903456789',
        role: 'Trainee',
        urlAvatar: 'https://placehold.co/40x40.png',
        startWork: new Date('2024-01-01'),
        createdAt: new Date(),
        modifiedAt: new Date()
    }
];

export const useUserStore = create<UserStore>((set) => ({
    users: initialUsers,
    setUsers: (users) => set({ users }),
    addUser: (user) => set((state) => ({
        users: [...state.users, user]
    })),
    updateUser: (userId, userData) => set((state) => ({
        users: state.users.map((user) =>
            user.id === userId ? { ...user, ...userData } : user
        ),
    })),
    deleteUser: (userId) => set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
    })),
})); 