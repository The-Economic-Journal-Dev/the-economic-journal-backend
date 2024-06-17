import Joi from "joi";

// Regular expression to match valid UTF-8 characters
const utf8Regex = /[\u0000-\u007F]|[\u0080-\u07FF]|[\u0800-\uFFFF]/;

// Define the Joi schema
const PostSchema = Joi.object({
  authorId: Joi.string().required().messages({
    "string.empty": "authorId is required",
  }),
  title: Joi.string().min(1).max(128).required().messages({
    "string.min": "Title must be at least 1 characters long",
    "string.max": "Title must be at most 128 characters long",
    "string.empty": "Title is required",
  }),
  imageUrl: Joi.string().allow(""),
  summary: Joi.string().allow(""),
  postBody: Joi.object().required().messages({
    "any.empty": "Body is required",
  }),
});

export default PostSchema;
