import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  },
});

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

export default transporter;
