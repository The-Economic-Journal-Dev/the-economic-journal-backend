import Joi from "joi";

// Define the Joi schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),

  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[^@]*$/, "no @ characters")
    .required()
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.max": "Username must be at most 30 characters long",
      "string.empty": "Username is required",
    }),

  password: Joi.string().min(3).max(30).required().messages({
    "string.min": "Password must be at least 3 characters long",
    "string.max": "Password must be at most 30 characters long",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match",
    "string.empty": "Confirm password is required",
  }),
});

export default registerSchema;
