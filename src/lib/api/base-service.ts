import apiClient from '@/lib/api-client';
import {
    ApiResponse,
    PaginatedResponse,
    PaginationParams,
    FilterParams,
    createUrl
} from './api-utils';

/**
 * Base Service Class
 * Provides common CRUD operations that can be extended by specific service modules
 */
export class BaseService<T, CreateDto = any, UpdateDto = any> {
    /**
     * Base endpoint for this service (e.g., '/users')
     */
    protected endpoint: string;

    /**
     * Constructor
     * @param endpoint - The base API endpoint for this service
     */
    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    /**
     * Get all items (unpaginated)
     */
    async getAll(): Promise<T[]> {
        const response = await apiClient.get<ApiResponse<T[]>>(this.endpoint);
        return response.data.data;
    }

    /**
     * Get paginated items with optional filtering and sorting
     */
    async getPaginated(params?: PaginationParams & FilterParams): Promise<PaginatedResponse<T>> {
        const url = createUrl(`${this.endpoint}/paginated`, params);
        const response = await apiClient.get<ApiResponse<PaginatedResponse<T>>>(url);
        return response.data.data;
    }

    /**
     * Get a single item by ID
     */
    async getById(id: string): Promise<T> {
        const response = await apiClient.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
        return response.data.data;
    }

    /**
     * Create a new item
     */
    async create(data: CreateDto): Promise<T> {
        const response = await apiClient.post<ApiResponse<T>>(this.endpoint, data);
        return response.data.data;
    }

    /**
     * Update an existing item
     */
    async update(id: string, data: UpdateDto): Promise<T> {
        const response = await apiClient.put<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
        return response.data.data;
    }

    /**
     * Partial update of an existing item
     */
    async patch(id: string, data: Partial<UpdateDto>): Promise<T> {
        const response = await apiClient.patch<ApiResponse<T>>(`${this.endpoint}/${id}`, data);
        return response.data.data;
    }

    /**
     * Delete an item
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    }

    /**
     * Get available methods for this resource (OPTIONS request)
     */
    async getOptions(): Promise<string[]> {
        const response = await apiClient.options<ApiResponse<{ methods: string[] }>>(this.endpoint);
        return response.data.data.methods;
    }
} 