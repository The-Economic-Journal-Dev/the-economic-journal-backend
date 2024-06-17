import { StatusCodes } from "http-status-codes";
import UserSchema from "../schema/UserSchema";

// Regular expression to match valid UTF-8 characters
const utf8Regex = /[\u0000-\u007F]|[\u0080-\u07FF]|[\u0800-\uFFFF]/;

// Function to check if a string contains only valid UTF-8 characters
const isValidUtf8 = (str: string): boolean => {
  return utf8Regex.test(str);
};

// Function to validate the request body
const validateRegister = (body: any) => {
  console.log("validateRegister started");
  const { error } = UserSchema.validate(body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return {
      status: StatusCodes.BAD_REQUEST,
      success: false,
      msg: `Validation errors: ${errorMessages}`,
    };
  }

  // Check if username and password contain only valid UTF-8 characters
  const { username, password } = body;
  if (!isValidUtf8(username) || !isValidUtf8(password)) {
    return {
      status: StatusCodes.BAD_REQUEST,
      success: false,
      msg: "Invalid UTF-8 characters in username or password",
    };
  }

  console.log("validateRegister finished");
  return {
    status: StatusCodes.OK,
    success: true,
    msg: "Validation successful",
  };
};

export default validateRegister;
