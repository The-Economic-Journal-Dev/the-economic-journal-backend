import registrationManager from "../auth/register-manager";
import { localRegisterMethod } from "../auth/register-strategies/register-local";

registrationManager.addMethod("local", localRegisterMethod);
