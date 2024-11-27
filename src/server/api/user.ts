import express, { Router, Request, Response } from "express";
import { wellKnownRegex } from "../utils/regex";
import User from "../models/user";
import bcrypt from "bcrypt";

const userRouter: Router = express.Router();

// signup route
userRouter.post(
  "/signup",
  (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.json({
        status: "FAILED",
        error: "Email and password required",
      });
    } else if (!wellKnownRegex.email.test(email)) {
      res.json({
        status: "FAILED",
        error: "Invalid email",
      });
    } else if (!wellKnownRegex.password.test(password)) {
      res.json({
        status: "FAILED",
        error:
          "password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character",
      });
    } else {
      User.find({ email })
        .then((users) => {
          if (users.length > 0) {
            res.json({
              status: "FAILED",
              error: "User already exists",
            });
          } else {
            const hashedPassword = bcrypt.hashSync(password, 10);

            const newUser = new User({
              email,
              password: hashedPassword,
            });

            newUser
              .save()
              .then((data) => {
                res.json({
                  status: "SUCCESS",
                  message: "User created successfully",
                  data,
                });
              })
              .catch((error) => {
                res.json({
                  status: "FAILED",
                  error: `Error while creating user: ${error}`,
                });
              });
          }
        })
        .catch((error) => {
          res.json({
            status: "FAILED",
            error: `Error while creating user: ${error}`,
          });
        });
    }
  }
);

// signin route
userRouter.post(
  "/signin",
  (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) => {
    let { email, password } = req.body;

    if (!email || !password) {
      res.json({
        status: "FAILED",
        error: "Email and password required",
      });
    }

    User.find({ email })
      .then((users) => {
        if (users.length === 0) {
          res.json({
            status: "FAILED",
            error: "User does not exist",
          });
        } else {
          const user = users[0];
          const hashedPassword = user.password;

          if (bcrypt.compareSync(password, hashedPassword)) {
            res.json({
              status: "SUCCESS",
              message: "User logged in successfully",
              data: user,
            });
          } else {
            res.json({
              status: "FAILED",
              error: "Invalid password",
            });
          }
        }
      })
      .catch((error) => {
        res.json({
          status: "FAILED",
          error: `Error while logging in: ${error}`,
        });
      });
  }
);

export default userRouter;
