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
        _id?: string; // Using string because Mongoose converts ObjectId to string
        uid: string;
        role: string;
        __v?: number;
      };
      files?: File[];
      file?: File;
    }
  }
}
