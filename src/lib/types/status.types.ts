export interface Status {
    id: number;
    name: string; // E.g., "Draft", "Published", "Active"
}

export interface CreateStatusRequest {
    name: string;
    type: "course" | "user"; // Still needed to differentiate which status type is being created
}

export interface UpdateStatusRequest {
    id: number;
    name?: string;
    type?: "course" | "user"; // Still needed to differentiate which status type is being updated
}
