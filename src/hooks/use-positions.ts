export interface Position {
  id: string;
  name: string;
}

// Constants based on backend PositionNames
export const POSITIONS: Position[] = [
  {
    id: "senior-manager",
    name: "Quản lý cấp cao",
  },
  {
    id: "middle-manager",
    name: "Quản lý cấp trung",
  },
  {
    id: "employee",
    name: "Nhân viên",
  },
  {
    id: "intern",
    name: "Thực tập sinh",
  },
];

export function usePositions() {
  return {
    positions: POSITIONS,
    isLoading: false,
    error: null,
  };
}
