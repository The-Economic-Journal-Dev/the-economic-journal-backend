import { Request, Response } from "express";
import { EmailVerificationTokenModel } from "../models/EmailVerifictionTokenModel";
import { StatusCodes } from "http-status-codes";

const validateEmail = async (req: Request, res: Response) => {
  console.log("Email validation called");
  const { token } = req.query;
  const { code } = req.body;

  const emailVerificationToken = await EmailVerificationTokenModel.findOne({
    token,
  });

  if (!emailVerificationToken) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      msg: "Invalid token",
    });
  }

  const isCodeValid = emailVerificationToken.code === code;
  if (!isCodeValid) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      msg: "Invalid code",
    });
  }

  res.status(200).json({ success: true, msg: "Email validation successful" });
};

export default validateEmail;
