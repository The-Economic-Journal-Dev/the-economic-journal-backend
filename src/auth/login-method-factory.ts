import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const LoginAuthenticationMethodFactory = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(
    "LoginAuthenticationFactory called with method:",
    req.params.method,
  );
  try {
    // Passport authentication middleware
    const authenticationMethod = passport.authenticate(req.params.method, {
      failureRedirect: "/",
      successRedirect: "/dashboard",
    });
    console.log(`Authentication method ${req.params.method} returned`);
    return authenticationMethod(req, res, next);
  } catch (error) {
    throwError(
      `Authentication method ${req.params.method} is not supported`,
      StatusCodes.METHOD_NOT_ALLOWED,
    );
  }
};

export default LoginAuthenticationMethodFactory;
