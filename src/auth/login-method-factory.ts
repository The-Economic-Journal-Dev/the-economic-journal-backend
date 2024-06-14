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
    const authenticationMethod = passport.authenticate(req.params.method);
    console.log(`Authentication method ${req.params.method} returned`);
    return authenticationMethod(req, res, next);
  } catch (error) {
    res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
      msg: `Authentication method ${req.params.method} is not supported`,
    });
  }
};

export default LoginAuthenticationMethodFactory;
