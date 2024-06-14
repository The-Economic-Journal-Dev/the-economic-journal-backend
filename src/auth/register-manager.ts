import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

// Define the type for the registration method
type RegisterMethod = (req: Request, res: Response, next: NextFunction) => void;

class RegistrationManager {
  private methods: Record<string, RegisterMethod> = {};

  // Method to add a new registration method
  public addMethod(name: string, method: RegisterMethod): void {
    if (this.methods[name]) {
      throw new Error(`Method ${name} already exists`);
    }
    this.methods[name] = method;
  }

  // Factory function to invoke the appropriate registration method
  public createMethod(methodName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      console.log("RegistrationManager called with method:", methodName);

      try {
        const registerMethod = this.methods[methodName];

        if (!registerMethod) {
          throw new Error(`Method ${methodName} is not supported`);
        }

        console.log(`Register method ${methodName} returned`);
        return registerMethod(req, res, next);
      } catch (error) {
        res.status(StatusCodes.METHOD_NOT_ALLOWED).json({
          success: false,
          msg: `Register method ${methodName} is not supported`,
        });
      }
    };
  }
}

// Create an instance of the RegistrationManager
const registrationManager = new RegistrationManager();

export default registrationManager;
