import { BaseService, QueryParams } from "@/lib/core";
import { Status, CreateStatusRequest, UpdateStatusRequest } from "@/lib/types/status.types";
import { API_CONFIG } from "@/lib/config";

export class StatusService extends BaseService<Status, CreateStatusRequest, UpdateStatusRequest> {
    constructor() {
        super(API_CONFIG.endpoints.status.base);
    }

    async getCourseStatuses(params?: QueryParams): Promise<Status[]> {
        return this.get<Status[]>(
            API_CONFIG.endpoints.status.courses.getAll, { params });
    }

    async createCourseStatus(payload: CreateStatusRequest): Promise<Status> {
        return this.post<Status>(
            API_CONFIG.endpoints.status.courses.create, payload);
    }

    async updateCourseStatus(id: string, payload: UpdateStatusRequest): Promise<Status> {
        return this.put<Status>(
            API_CONFIG.endpoints.status.courses.update(id), payload);
    }

    async deleteCourseStatus(id: string): Promise<void> {
        await this.delete<void>(
            API_CONFIG.endpoints.status.courses.delete(id));
    }

    async getUserStatuses(params?: QueryParams): Promise<Status[]> {
        return this.get<Status[]>(
            API_CONFIG.endpoints.status.users.getAll, { params });
    }

    async createUserStatus(payload: CreateStatusRequest): Promise<Status> {
        return this.post<Status>(
            API_CONFIG.endpoints.status.users.create, payload);
    }

    async updateUserStatus(id: string, payload: UpdateStatusRequest): Promise<Status> {
        return this.put<Status>(
            API_CONFIG.endpoints.status.users.update(id), payload);
    }

    async deleteUserStatus(id: string): Promise<void> {
        await this.delete<void>(
            API_CONFIG.endpoints.status.users.delete(id));
    }
}

export const statusService = new StatusService();
export default statusService;
