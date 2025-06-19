import apiClient from "../api-client";
import { Position } from "../types/position";
import { API_CONFIG } from "../api/config";

class PositionApiService {
  async getPositions(): Promise<Position[]> {
    try {
      const response = await apiClient.get(API_CONFIG.endpoints.positions.base);
      // API trả về { message, code, data: Position[] }
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }

  async getPositionById(id: number): Promise<Position> {
    try {
      const response = await apiClient.get(`/api/Positions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching position with id ${id}:`, error);
      throw error;
    }
  }
  async createPosition(
    positionData: Omit<Position, "positionId">
  ): Promise<Position> {
    try {
      const response = await apiClient.post("/api/Positions", positionData);
      return response.data;
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
      const response = await apiClient.put(
        `/api/Positions/${id}`,
        positionData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating position with id ${id}:`, error);
      throw error;
    }
  }

  async deletePosition(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/Positions/${id}`);
    } catch (error) {
      console.error(`Error deleting position with id ${id}:`, error);
      throw error;
    }
  }
}

export const positionApiService = new PositionApiService();
