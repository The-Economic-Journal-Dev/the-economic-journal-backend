import dns from "dns";
import transporter from "./mailer";
import { StatusCodes } from "http-status-codes";
import {
  generateVerificationCode,
  generateRandomToken,
} from "./token-generator";
import dnsCache from "./cache-utils";

const sendEmailToValidate = async (email: string) => {
  // Split the email address into its parts
  const parts = email.split("@");

  // Check if there are exactly two parts
  if (parts.length !== 2) {
    return {
      success: false,
      status: StatusCodes.BAD_REQUEST,
      message: "Email must contain exactly one '@' symbol",
    };
  }

  // Extract the domain part
  const domain = parts[1];

  // Check if the domain contains at least one dot
  if (!domain.includes(".")) {
    return {
      success: false,
      status: StatusCodes.BAD_REQUEST,
      message: "Email domain must contain at least one '.'",
    };
  }

  // Check the cache first
  const cachedRecords = dnsCache.get(domain);
  if (!cachedRecords) {
    // Perform DNS MX record lookup if it doesn't exist in cache
    try {
      const records = await dns.promises.resolveMx(domain);
      if (records.length === 0) {
        return {
          success: false,
          status: StatusCodes.BAD_REQUEST,
          message: "Email domain has no MX records",
        };
      }
    } catch (error) {
      return {
        success: false,
        status: StatusCodes.BAD_REQUEST,
        message: `DNS lookup failed: ${(error as Error).message}`,
      };
    }
  }

  // Generate a random verification token
  const verificationToken = await generateRandomToken(128);
  const verificationCode = await generateVerificationCode();

  // Send verification email
  try {
    const verificationLink = `${process.env.BASE_URL}/verify?token=${encodeURIComponent(verificationToken)}`;

    const info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL, // Replace with your sender address
      to: email, // List of receivers
      subject: "Email Verification", // Subject line
      text: "Please verify your email by clicking the following link:", // Plain text body
      html: `<b>Please verify your email by clicking the following link:</b> 
      <a href="${verificationLink}">Verify Email Using Code: ${verificationCode}</a>`, // HTML body
    });

    console.log(
      `${process.env.BASE_URL}/auth/verify?token=${encodeURIComponent(verificationToken)}`,
    );
    console.log(`${verificationCode}`);

    console.log("Message sent: %s", info.messageId);
    return {
      success: true,
      status: 200,
      message: `Message sent: ${info.messageId}`,
      verificationToken,
      verificationCode,
    };
  } catch (error) {
    return {
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: `Failed to send verification email: ${(error as Error).message}`,
    };
  }
};

export default sendEmailToValidate;
