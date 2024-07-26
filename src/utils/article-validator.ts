import { StatusCodes } from "http-status-codes";
import { ArticleSchema } from "../schema/ArticleSchema";

// Function to validate the request body
const validateArticle = (body: any) => {
  console.log("validateArticle started");
  const { error } = ArticleSchema.validate(body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details
      .map((detail) => detail.message)
      .join(", ");
    return {
      status: StatusCodes.BAD_REQUEST,
      success: false,
      message: `Validation errors: ${errorMessages}`,
    };
  }

  console.log("validateArticle finished");
  return {
    status: StatusCodes.OK,
    success: true,
    message: "Validation successful",
  };
};

export { validateArticle };
