export interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
  details: unknown;
}

export interface EmptyApiResponse {
  ok: boolean;
  message: string;
  data: null;
  details: unknown;
}
