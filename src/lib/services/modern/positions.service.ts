
import { BaseService, ApiResponse, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/config";
import type { Position } from "@/lib/types/user.types";

export interface CreatePositionPayload {
  positionName: string;
}

export interface UpdatePositionPayload {
  positionName?: string;
}

export interface PositionQueryParams extends QueryParams {
  name?: string;
}

export class PositionsService extends BaseService<
  Position,
  CreatePositionPayload,
  UpdatePositionPayload
> {
  constructor() {
    super(API_CONFIG.endpoints.positions.base);
  }

  async getPositions(params?: PositionQueryParams): Promise<Position[]> {
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

export const positionsService = new PositionsService();
export default positionsService;
