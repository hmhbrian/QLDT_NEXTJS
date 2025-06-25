
import { BaseService, ApiResponse, QueryParams } from "../../core";
import { API_CONFIG } from "@/lib/legacy-api/config";
import type { Position } from "@/lib/types";

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
    const response = await this.get<ApiResponse<Position[]>>(this.endpoint, {
      params,
    });
    return this.extractData(response) || [];
  }

  async getPositionById(id: string | number): Promise<Position> {
    const response = await super.getById(String(id));
    const data = this.extractData(response);
    if (!data) {
      throw new Error(`Position with ID ${id} not found.`);
    }
    return data;
  }

  async createPosition(payload: CreatePositionPayload): Promise<Position> {
    const response = await this.create(payload);
    return this.extractData(response);
  }

  async updatePosition(
    id: string | number,
    payload: UpdatePositionPayload
  ): Promise<Position> {
    const response = await this.update(String(id), payload);
    return this.extractData(response);
  }

  async deletePosition(id: string | number): Promise<void> {
    await this.remove(String(id));
  }
}

export const positionsService = new PositionsService();
export default positionsService;
