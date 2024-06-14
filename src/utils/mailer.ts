import nodemailer from "nodemailer";

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // SMTP host
  port: 587, // SMTP port
  secure: false, // true for 465, false for other ports
  auth: {
    user: "gussie68@ethereal.email",
    pass: "vsW6tgXRWAUuMVVC9w",
  },
});

export default transporter;
