export type ApiErrorMessage = string | string[];

export type ApiJsonPrimitive = string | number | boolean | null;

export type ApiJsonValue =
  | ApiJsonPrimitive
  | ApiJsonValue[]
  | { [key: string]: ApiJsonValue };

export type ApiValidationDetail = {
  field?: string;
  kind?: string;
  message?: string;
  path?: string;
  value?: ApiJsonValue;
};

export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: ApiErrorMessage;
  timestamp: string;
  path: string;
  method: string;
  details?: ApiValidationDetail[] | { [key: string]: ApiJsonValue };
};
