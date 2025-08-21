export type TGetParamValue = string | boolean | number;

export interface IHttpClient {

  get<ResponseType>(url: string, params?: Record<string, TGetParamValue>, options?: RequestInit): Promise<ResponseType>;

  post<BodyType, ResponseType>(url: string, body?: BodyType, options?: RequestInit): Promise<ResponseType>;
  
}
