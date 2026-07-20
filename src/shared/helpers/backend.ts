import {
  API_DATABASE_ERROR_MESSAGES,
  API_ERROR_MESSAGES,
  API_FIELD_LABELS,
  API_VALIDATION_MESSAGE_PATTERNS,
} from "../constants/backend";
import { ApiErrorResponse } from "../types/backend";

export function getApiErrorMessage(error: ApiErrorResponse) {
  if (Array.isArray(error.message)) {
    const mappedMessage = error.message
      .map((message) => mapApiMessage(message))
      .find(Boolean);

    return mappedMessage ?? API_ERROR_MESSAGES[error.statusCode];
  }

  return (
    mapApiMessage(error.message) ??
    API_ERROR_MESSAGES[error.statusCode] ??
    "Erro inesperado."
  );
}

function mapApiMessage(message?: string) {
  if (!message) {
    return null;
  }

  const databaseMessage = API_DATABASE_ERROR_MESSAGES[message];

  if (databaseMessage) {
    return databaseMessage;
  }

  for (const validationMessagePattern of API_VALIDATION_MESSAGE_PATTERNS) {
    const match = message.match(validationMessagePattern.pattern);

    if (match) {
      const fieldName = match[1] ?? "";
      const fieldLabel = API_FIELD_LABELS[fieldName] ?? "informado";

      return validationMessagePattern.getMessage(fieldLabel, match);
    }
  }

  return isProbablyTechnicalMessage(message) ? null : normalizeFriendlyMessage(message);
}

function isProbablyTechnicalMessage(message: string) {
  return (
    /^[A-Z][A-Za-z\s]+$/.test(message) ||
    message.includes("property ") ||
    message.includes(" must be ") ||
    message.includes(" should ") ||
    message.includes("Mongo") ||
    message.includes("CastError") ||
    message.includes("ValidationError") ||
    message.includes("ObjectId") ||
    message.includes("E11000")
  );
}

function normalizeFriendlyMessage(message: string) {
  return message || null;
}
