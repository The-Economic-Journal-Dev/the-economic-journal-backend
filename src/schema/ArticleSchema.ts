import Joi from "joi";

// Regular expression to match valid UTF-8 characters
const utf8Regex = /[\u0000-\u007F]|[\u0080-\u07FF]|[\u0800-\uFFFF]/;

// Define the Joi schema
const ArticleSchema = Joi.object({
  title: Joi.string().min(1).max(128).required().messages({
    "string.min": "Title must be at least 1 characters long",
    "string.max": "Title must be at most 128 characters long",
    "string.empty": "Title is required",
  }),
  metaTitle: Joi.string().min(1).max(64).required().messages({
    "string.min": "metaTitle must be at least 1 characters long",
    "string.max": "metaTitle must be at most 64 characters long",
    "string.empty": "A metaTitle is required",
  }),
  summary: Joi.string().allow(""),
  articleBody: Joi.string().min(1).required().messages({
    "any.empty": "Body is required",
    "any.min": "Body must be at least 1 characters long",
    "any.max": "Body must be less than 2000 characters long",
  }),
});

export { ArticleSchema };
