export interface ResponseError {
    message: string;
    code?: number;
    name: string;
    data?: unknown[];
}
export interface ApiError {
    name: string;
    message: string;
    code: number;
    data: unknown[];
}
