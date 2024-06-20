import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

// Define the type for the registration method
type RegisterMethod = (req: Request, res: Response, next: NextFunction) => void;

/**
 * Class that manages registration methods and handles method invocation.
 */
class RegistrationManager {
  private methods: Record<string, RegisterMethod> = {};

  /**
   * Adds a new registration method to the manager.
   * @param name - The name of the registration method.
   * @param method - The registration method function.
   * @throws Error if a method with the same name already exists.
   */
  public addMethod(name: string, method: RegisterMethod): void {
    if (this.methods[name]) {
      throw new Error(`Method ${name} already exists`);
    }
    this.methods[name] = method;
  }

  /**
   * Factory function that creates a middleware to invoke a registration method.
   * @param methodName - The name of the registration method to invoke.
   * @returns Express middleware function that invokes the registration method.
   */
  public createMethod(methodName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      console.log("RegistrationManager called with method:", methodName);

      const registerMethod = this.methods[methodName];

      if (!registerMethod) {
        throwError(
          `Register method ${methodName} is not supported`,
          StatusCodes.METHOD_NOT_ALLOWED,
        );
      }

      console.log(`Register method ${methodName} returned`);
      return registerMethod(req, res, next);
    };
  }
}

// Create an instance of the RegistrationManager
const registrationManager = new RegistrationManager();

export default registrationManager;
