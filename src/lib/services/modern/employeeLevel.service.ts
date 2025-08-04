import { BaseService, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import type { Position } from "@/lib/types/user.types";

export interface CreatePositionPayload {
  PositionName: string;
}

export interface UpdatePositionPayload {
  PositionName?: string;
}

export interface PositionQueryParams extends QueryParams {
  name?: string;
}

class EmployeeLevelServiceClass extends BaseService<
  Position,
  CreatePositionPayload,
  UpdatePositionPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.EmployeeLevel.base);
  }

  async getEmployeeLevel(params?: PositionQueryParams): Promise<Position[]> {
    return this.get<Position[]>(this.endpoint, { params });
  }

  async getPositionById(id: string | number): Promise<Position> {
    return this.get<Position>(`${this.endpoint}/${id}`);
  }

  async createPosition(payload: CreatePositionPayload): Promise<Position> {
    return this.post<Position>(this.endpoint, payload);
  }

  async updatePosition(
    id: string | number,
    payload: UpdatePositionPayload
  ): Promise<Position> {
    return this.put<Position>(`${this.endpoint}/${id}`, payload);
  }

  async deletePosition(id: string | number): Promise<void> {
    await this.delete<void>(`${this.endpoint}/${id}`);
  }
}

export const EmployeeLevelService = new EmployeeLevelServiceClass();
export default EmployeeLevelService;
