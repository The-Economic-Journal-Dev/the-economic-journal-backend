import { HttpError } from "../errors/custom-errors";

const throwErrorImpl = function (
  messageOrError: string | Error = "Internal Server Error",
  statusCode: number = 500,
): never {
  let error: HttpError;
  if (messageOrError instanceof Error) {
    error = messageOrError as HttpError;
    if (statusCode) {
      error.status = statusCode;
    }
  } else {
    const message = messageOrError as string;
    error = new HttpError(message, statusCode);
    error.status = statusCode;
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
  function throwError(
    messageOrError?: string | Error,
    statusCode?: number,
  ): never;
}

(global as any).throwError = throwErrorImpl;
