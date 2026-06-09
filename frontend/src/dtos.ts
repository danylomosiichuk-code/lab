export interface AccessRequest {
    id: number;
    userId: number;
    userName?: string; 
    date: string;
    accessType: string;
    status: string;
    comments: string;
}

export interface ApiError {
    status: number;
    message: string;
    details?: string;
}