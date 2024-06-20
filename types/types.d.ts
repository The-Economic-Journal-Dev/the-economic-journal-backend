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
  }
  interface Session {
    user?: { [key: string]: any }; // Adjust the type according to your user object structure
    views: number;
  }
}

declare module "express-session" {
  interface Session {
    user?: { [key: string]: any }; // Adjust the type according to your user object structure
  }
}
