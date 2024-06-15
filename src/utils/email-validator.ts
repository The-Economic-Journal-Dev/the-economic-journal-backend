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
      msg: "Email must contain exactly one '@' symbol",
    };
  }

  // Extract the domain part
  const domain = parts[1];

  // Check if the domain contains at least one dot
  if (!domain.includes(".")) {
    return {
      success: false,
      status: StatusCodes.BAD_REQUEST,
      msg: "Email domain must contain at least one '.'",
    };
  }

  // Check the cache first
  const cachedRecords = dnsCache.get(domain);
  if (cachedRecords) {
    return {
      success: true,
      status: StatusCodes.OK,
      msg: "Cached MX records found",
      records: cachedRecords,
    };
  }

  // Perform DNS MX record lookup
  try {
    const records = await dns.promises.resolveMx(domain);
    if (records.length === 0) {
      return {
        success: false,
        status: StatusCodes.BAD_REQUEST,
        msg: "Email domain has no MX records",
      };
    }
  } catch (error) {
    return {
      success: false,
      status: StatusCodes.BAD_REQUEST,
      msg: `DNS lookup failed: ${(error as Error).message}`,
    };
  }

  // Generate a random verification token
  const verificationToken = await generateRandomToken(128);
  const verificationCode = await generateVerificationCode();

  // Send verification email
  try {
    const info = await transporter.sendMail({
      from: '"Your App Name" gussie68@ethereal.email', // Replace with your sender address
      to: email, // List of receivers
      subject: "Email Verification", // Subject line
      text: "Please verify your email by clicking the following link:", // Plain text body
      html: `<b>Please verify your email by clicking the following link:</b> 
      <a href="${process.env.BASE_URL}/auth/verify?token=${encodeURIComponent(verificationToken)}">Verify Email Using Code: ${verificationCode}</a>`, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, verificationToken, verificationCode };
  } catch (error) {
    return {
      success: false,
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      msg: `Failed to send verification email: ${(error as Error).message}`,
    };
  }
};

export default sendEmailToValidate;
