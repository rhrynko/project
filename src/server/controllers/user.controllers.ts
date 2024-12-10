import { Request, Response } from "express";
import { wellKnownRegex } from "../utils/regex";
import User from "../models/user";
import bcrypt from "bcrypt";

// Enums for statuses
enum ResponseStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

// Interface for response
interface ApiResponse<T> {
  status: ResponseStatus;
  message?: string;
  error?: string;
  data?: T;
}

// Signup controller
export const signup = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response<ApiResponse<{ email: string; password: string }>>
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({
      status: ResponseStatus.FAILED,
      error: "Email and password required",
    });

    return;
  }

  if (!wellKnownRegex.email.test(email)) {
    res.json({
      status: ResponseStatus.FAILED,
      error: "Invalid email",
    });
  }

  if (!wellKnownRegex.password.test(password)) {
    res.json({
      status: ResponseStatus.FAILED,
      error:
        "Password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one digit, and one special character",
    });

    return;
  }

  try {
    const existingUsers = await User.find({ email });

    if (existingUsers.length > 0) {
      res.json({
        status: ResponseStatus.FAILED,
        error: "User already exists",
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const data = await newUser.save();

    res.json({
      status: ResponseStatus.SUCCESS,
      message: "User created successfully",
      data,
    });
  } catch (error) {
    res.json({
      status: ResponseStatus.FAILED,
      error: `Error while creating user: ${error}`,
    });
  }
};

// Signin controller
export const signin = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response<ApiResponse<{ email: string; password: string }>>
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.json({
      status: ResponseStatus.FAILED,
      error: "Email and password required",
    });
  }

  try {
    const users = await User.find({ email });

    if (users.length === 0) {
      res.json({
        status: ResponseStatus.FAILED,
        error: "User does not exist",
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.json({
        status: ResponseStatus.FAILED,
        error: "Invalid password",
      });
    }

    res.json({
      status: ResponseStatus.SUCCESS,
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    res.json({
      status: ResponseStatus.FAILED,
      error: `Error while logging in: ${error}`,
    });
  }
};
