import { ApiErrorResponse, ApiJsonValue } from "../types/backend";

const fallbackApiErrorResponse: ApiErrorResponse = {
  error: "Internal Server Error",
  message: "Nao foi possivel processar a resposta da API.",
  method: "GET",
  path: "",
  statusCode: 500,
  timestamp: "",
};

export class ApiClientError extends Error {
  readonly response: ApiErrorResponse;
  readonly statusCode: number;

  constructor(response: ApiErrorResponse) {
    super(getApiErrorTitle(response));
    this.name = "ApiClientError";
    this.response = response;
    this.statusCode = response.statusCode;
  }
}

export async function parseApiResponse<TResponse>(
  response: Response,
): Promise<TResponse> {
  const payload = (await response.json()) as ApiJsonValue;

  if (!response.ok) {
    throw new ApiClientError(toApiErrorResponse(payload, response));
  }

  return payload as TResponse;
}

function toApiErrorResponse(
  payload: ApiJsonValue,
  response: Response,
): ApiErrorResponse {
  if (!isApiJsonObject(payload)) {
    return {
      ...fallbackApiErrorResponse,
      method: response.url,
      statusCode: response.status,
    };
  }

  return {
    error: getStringField(payload, "error", response.statusText),
    message: getErrorMessageField(payload),
    method: getStringField(payload, "method", "GET"),
    path: getStringField(payload, "path", response.url),
    statusCode: getNumberField(payload, "statusCode", response.status),
    timestamp: getStringField(payload, "timestamp", new Date().toISOString()),
  };
}

function getApiErrorTitle(response: ApiErrorResponse) {
  return Array.isArray(response.message)
    ? response.message[0] || response.error
    : response.message;
}

function getErrorMessageField(payload: ApiJsonObject) {
  const message = payload.message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === "string");
  }

  return fallbackApiErrorResponse.message;
}

function getNumberField(
  payload: ApiJsonObject,
  fieldName: string,
  fallback: number,
) {
  const value = payload[fieldName];

  return typeof value === "number" ? value : fallback;
}

function getStringField(
  payload: ApiJsonObject,
  fieldName: string,
  fallback: string,
) {
  const value = payload[fieldName];

  return typeof value === "string" ? value : fallback;
}

type ApiJsonObject = { [key: string]: ApiJsonValue };

function isApiJsonObject(value: ApiJsonValue): value is ApiJsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
