/**
 * Modern Positions Service
 * Uses core architecture for clean and consistent API operations
 */

import { 
  BaseService, 
  ApiResponse, 
  PaginatedResponse, 
  QueryParams,
  BaseCreatePayload,
  BaseUpdatePayload
} from '../../core';

// Position entity type (import from main types)
export interface Position {
  positionId: number;
  positionName: string;
}

// Specific query params for positions
export interface PositionQueryParams extends QueryParams {
  name?: string;
}

// Create/Update payload types
export interface CreatePositionPayload extends BaseCreatePayload {
  positionName: string;
}

export interface UpdatePositionPayload extends BaseUpdatePayload {
  positionName?: string;
}

// Helper function to convert to backend format
function toPositionQueryParams(params: PositionQueryParams): Record<string, any> {
  return {
    ...params,
    PositionName: params.name,
    // Remove frontend properties
    name: undefined,
  };
}

/**
 * Modern Positions Service
 * Provides clean, typed API for positions operations
 */
export class PositionsService extends BaseService<Position> {
  constructor() {
    super('/Positions');
  }

  /**
   * Get all positions
   */
  async getPositions(params?: PositionQueryParams): Promise<Position[]> {
    const queryParams = params ? toPositionQueryParams(params) : undefined;
    const response = await this.get<ApiResponse<Position[]>>(this.endpoint + (queryParams ? this.buildQueryString(queryParams) : ''));
    return response.data;
  }

  /**
   * Get position by ID
   */
  async getPositionById(id: number): Promise<Position> {
    const response = await this.get<ApiResponse<Position>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  /**
   * Create new position
   */
  async createPosition(payload: CreatePositionPayload): Promise<Position> {
    const response = await this.create(payload);
    return response.data;
  }

  /**
   * Update position
   */
  async updatePosition(id: number, payload: UpdatePositionPayload): Promise<Position> {
    const response = await this.patch<ApiResponse<Position>>(`${this.endpoint}/${id}`, payload);
    return response.data;
  }

  /**
   * Delete position
   */
  async deletePosition(id: number): Promise<void> {
    await this.delete(`${this.endpoint}/${id}`);
  }
}

// Export singleton instance
export const positionsService = new PositionsService();
export default positionsService;
