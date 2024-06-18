import * as express from "express";
import { SessionData } from "express-session";
import { Transform } from "stream";
import "express-session";

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

declare global {
  /**
   * Throws an HTTP error with an optional status code.
   * @param {string | Error} messageOrError - The error message or an Error object.
   * @param {number} [statusCode] - The HTTP status code (optional, defaults to 500).
   * @throws {HttpError} Throws an HTTP error with the provided message and status code.
   */
  function throwError(message: string | Error, statusCode?: number): void;
  namespace Express {
    interface Request {
      user?: {
        active: boolean;
        _id: string; // Using string because Mongoose converts ObjectId to string
        email: string;
        username: string;
        password: string;
        __v: number;
      };
      files?: File[];
      file?: File;
    }
  }
}

// Extend the express-session module to include custom session data
declare module "express-session" {
  interface SessionData {
    views: number;
    username: string;
  }
}

declare module "express-session" {
  interface Session {
    user?: { [key: string]: any }; // Adjust the type according to your user object structure
  }
}
