import apiClient from "@/lib/api-client";
import { API_CONFIG } from "@/lib/api/config";
import axios from "axios";

export interface Role {
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
    permissions?: string[];
}

export interface ApiResponse<T = any> {
    message: string;
    code: string;
    data?: T;
    statusCode: number;
    errors?: string[];
}

/**
 * Lấy danh sách tất cả vai trò từ API
 */
export const fetchRoles = async (): Promise<ApiResponse<Role[]>> => {
    try {
        // Gọi trực tiếp đến API backend
        const apiUrl = `${API_CONFIG.baseURL}/Roles`;
        console.log("Fetching roles from:", apiUrl);

        const response = await axios.get<ApiResponse<Role[]>>(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: API_CONFIG.timeout
        });

        console.log("Roles API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
};

/**
 * Lấy thông tin vai trò theo ID
 */
export const fetchRoleById = async (id: string): Promise<ApiResponse<Role>> => {
    try {
        const apiUrl = `${API_CONFIG.baseURL}/Roles/${id}`;
        const response = await axios.get<ApiResponse<Role>>(apiUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching role with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Lấy thông tin vai trò theo tên
 */
export const fetchRoleByName = async (name: string): Promise<ApiResponse<Role>> => {
    try {
        const apiUrl = `${API_CONFIG.baseURL}/Roles/byName/${name}`;
        const response = await axios.get<ApiResponse<Role>>(apiUrl);
        return response.data;
    } catch (error) {
        console.error(`Error fetching role with name ${name}:`, error);
        throw error;
    }
};

/**
 * Tạo vai trò mới
 */
export const createRole = async (roleData: Omit<Role, "id">) => {
    try {
        const response = await apiClient.post("/Roles", roleData);
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
};

/**
 * Cập nhật vai trò
 */
export const updateRole = async (id: number, roleData: Partial<Role>) => {
    try {
        const response = await apiClient.put(`/Roles/${id}`, roleData);
        return response.data;
    } catch (error) {
        console.error(`Error updating role with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Xóa vai trò
 */
export const deleteRole = async (id: number) => {
    try {
        const response = await apiClient.delete(`/Roles/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting role with ID ${id}:`, error);
        throw error;
    }
}; 