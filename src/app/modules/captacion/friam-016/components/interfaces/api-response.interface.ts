export interface ApiResponse<T> {
  status: number;
  statusmsg: string;
  data: T;
}
