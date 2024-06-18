import { HttpError } from "../errors/custom-errors";

global.throwError = function (
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
