export interface Status {
    id: number;
    name: string;
}

export interface CreateStatusRequest {
    name: string;
}

export interface UpdateStatusRequest {
    id: number;
    name?: string;
}
