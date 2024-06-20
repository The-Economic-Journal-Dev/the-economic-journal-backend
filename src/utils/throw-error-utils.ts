import { HttpError } from "../errors/custom-errors";

const throwError = function (
  messageOrError: string | Error,
  statusCode?: number,
) {
  let error: HttpError;

  if (messageOrError instanceof Error) {
    error = messageOrError as HttpError;
    if (statusCode) {
      error.status = statusCode;
    }
  } else {
    const message = messageOrError as string;
    error = new HttpError(message, statusCode || 500);
    error.status = statusCode || 500;
  }

  throw error;
};

declare global {
  /**
   * Throws an HttpError with the given message or Error instance.
   *
   * @param {string | Error} messageOrError - The error message or Error instance.
   * @param {number} [statusCode] - Optional HTTP status code.
   * @throws {HttpError} - Throws an HttpError with the specified message and status code.
   */
  function throwError(message: string | Error, statusCode?: number): void;
}

(global as any).throwError = throwError;