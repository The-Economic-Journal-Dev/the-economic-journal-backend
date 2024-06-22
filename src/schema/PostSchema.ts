import Joi from "joi";

// Regular expression to match valid UTF-8 characters
const utf8Regex = /[\u0000-\u007F]|[\u0080-\u07FF]|[\u0800-\uFFFF]/;

// Define the Joi schema
const PostSchema = Joi.object({
  title: Joi.string().min(1).max(128).required().messages({
    "string.min": "Title must be at least 1 characters long",
    "string.max": "Title must be at most 128 characters long",
    "string.empty": "Title is required",
  }),
  imageUrl: Joi.string().allow(""),
  summary: Joi.string().allow(""),
  postBody: Joi.string().min(1).required().messages({
    "any.empty": "Body is required",
    "any.min": "Body must be at least 1 characters long",
  }),
});

export default PostSchema;
