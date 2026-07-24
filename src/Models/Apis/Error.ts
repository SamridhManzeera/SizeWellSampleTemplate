export interface ErrorResponse {
  status: number;
  data: ErrorData;
  error?: string;
}

interface ErrorData {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
}

export interface ApiError {
  error: ErrorResponse;
}
