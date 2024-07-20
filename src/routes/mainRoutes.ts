import express, { Request, Response } from "express";
import { authenticateFirebaseId } from "../auth/authenticate-firebase-cred";

const router = express.Router();

router.get("/", async (req, res) => {
  const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hello World!</title>
        </head>
        <body>
            <h1>Hello World!</h1>
        </body>
        </html>
    `;
  res.send(htmlContent);
});

router
  .route("/protected")
  .get(authenticateFirebaseId, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "User authenticated with a session",
      user: req.user,
    });
  });

export default router;
