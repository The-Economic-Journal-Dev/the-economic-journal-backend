import { StatusCodes } from "http-status-codes";
import { PostSchema } from "../schema/PostSchema";

// Function to validate the request body
const validatePost = (body: any) => {
  console.log("validatePost started");
  const { error } = PostSchema.validate(body, { abortEarly: false });

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

  console.log("validatePost finished");
  return {
    status: StatusCodes.OK,
    success: true,
    msg: "Validation successful",
  };
};

export { validatePost };
