import { Request, Response } from "express";
import { EmailVerificationTokenModel } from "../models/EmailVerifictionTokenModel";

const validateEmail = async (req: Request, res: Response) => {
  console.log("Email validation called");
  const { email, token } = req.query;

  const emailVerificationToken = await EmailVerificationTokenModel.findOne({
    email,
    token,
  });

  res.status(200).json({ msg: "Email validation successful" });
};
