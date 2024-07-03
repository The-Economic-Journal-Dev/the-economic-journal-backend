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

  const callback = function (error: Error, user: any, info: any) {
    if (error) {
      console.log("Authentication error:", error);
      throwError(error);
    }
    if (!user) {
      console.log("Authentication failed:", info);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: { message: "Authentication failed", details: info },
      });
    }
    req.logIn(user, (error) => {
      if (error) {
        console.log("Login error:", error);
        throwError(error);
      }
      console.log("Authentication successful");
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Authentication successful",
      });
    });
  };
  console.log(req.body);
  try {
    // Passport authentication middleware
    const authenticationMethod = passport.authenticate(
      req.params.method,
      callback,
    );
    console.log(`Authentication method ${req.params.method} returned`);
    return authenticationMethod(req, res, next);
  } catch (error) {
    console.log("Error");
    throwError(
      `Authentication method ${req.params.method} is not supported`,
      StatusCodes.METHOD_NOT_ALLOWED,
    );
  }
};

export default LoginAuthenticationMethodFactory;
