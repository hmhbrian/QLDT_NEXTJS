/**
 * Positions API Service
 * Handles all position-related API operations
 */
import { BaseApiService, ApiResponse } from "./base-api.service";
import { Position } from "../types/position";

class PositionsApiService extends BaseApiService {
  constructor() {
    super("/Positions");
  }

  async getPositions(): Promise<Position[]> {
    try {
      const response = await this.get<ApiResponse<Position[]>>("/Positions");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }

  async getPositionById(id: number): Promise<Position> {
    try {
      const response = await this.get<ApiResponse<Position>>(
        `/Positions/${id}`
      );
      return response.data!;
    } catch (error) {
      console.error(`Error fetching position with id ${id}:`, error);
      throw error;
    }
  }

  async createPosition(
    positionData: Omit<Position, "positionId">
  ): Promise<Position> {
    try {
      const response = await this.post<ApiResponse<Position>>(
        "/Positions",
        positionData
      );
      return response.data!;
    } catch (error) {
      console.error("Error creating position:", error);
      throw error;
    }
  }

  async updatePosition(
    id: number,
    positionData: Partial<Omit<Position, "positionId">>
  ): Promise<Position> {
    try {
      const response = await this.put<ApiResponse<Position>>(
        `/Positions/${id}`,
        positionData
      );
      return response.data!;
    } catch (error) {
      console.error(`Error updating position with id ${id}:`, error);
      throw error;
    }
  }

  async deletePosition(id: number): Promise<void> {
    try {
      await this.delete<ApiResponse<void>>(`/Positions/${id}`);
    } catch (error) {
      console.error(`Error deleting position with id ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const positionsApiService = new PositionsApiService();
export default positionsApiService;
