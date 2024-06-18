import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import registrationManager from "./register-manager";

const RegisterMethodFactory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("RegisterMethodFactory called with method:", req.params.method);
  try {
    // Passport authentication middleware
    const registrationMethod = registrationManager.createMethod(
      req.params.method,
    );
    console.log(`Authentication method ${req.params.method} returned`);
    return registrationMethod(req, res, next);
  } catch (error) {
    throwError(error as Error, StatusCodes.METHOD_NOT_ALLOWED);
  }
};

export default RegisterMethodFactory;
