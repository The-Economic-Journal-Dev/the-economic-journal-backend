import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/custom-errors";

// Define error handling middleware
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof Error) {
    console.error(err.stack); // Log the error for debugging purposes

    // Customize error response based on the error status
    const status = (err as HttpError)?.status || 500; // Default to 500 Internal Server Error
    res.status(status).json({
      success: false,
      error: {
        message: err.message || "Internal Server Error",
        status: status, // Include the status code in the response
      },
    });
  }
};

export default errorHandler;
