import nodemailer from "nodemailer";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com", // SMTP host
  port: 465, // SMTP port
  secure: true, // true for 465, false for other ports
  auth: {
    user: "the-economic-journal@zohomail.com",
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

export default transporter;
