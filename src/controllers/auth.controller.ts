import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel, {
  userDTO,
  userLoginDTO,
  userUpdatePasswordDTO,
} from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { renderMailHTML, sendMail } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Tlogin = {
  identifier: string;
  password: string;
};

const registerValidateSchema = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string()
    .required()
    .min(6, "password must be 6 characters")
    .test(
      "at-least-one-uppercase",
      "Password must contain an uppercase character",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
    .test("at-least-one-number", "Password must contain a number", (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }),

  confirmPassword: Yup.string()
    .required()
    .oneOf([Yup.ref("password"), ""], "Password not match"),
});

export default {
  async updateProfile(req: IReqUser, res: Response) {
    try {
      const userId = req.user?.id;
      const { fullName, profilePicture } = req.body; // request body data ini

      const result = await UserModel.findByIdAndUpdate(
        userId,
        {
          fullName,
          profilePicture,
        },
        {
          new: true,
        }
      );

      if (!result) return response.notFound(res, "user not found");

      response.success(res, result, "success update profile");
    } catch (error) {
      response.error(res, error, "failed to update profile");
    }
  },

  async updatePassword(req: IReqUser, res: Response) {
    const userId = req.user?.id;
    const { oldPassword, password, confirmPassword } = req.body; // request body data ini

    await userUpdatePasswordDTO.validate({
      oldPassword,
      password,
      confirmPassword,
    });

    const user = await UserModel.findById(userId);

    // kalau user gak ada atau password existing tidak terdaftar
    if (!user) return response.notFound(res, "user not found");

    const validatePassword = await bcrypt.compare(oldPassword, user.password);

    if (!validatePassword)
      return response.error(res, null, "password not match");

    const result = await UserModel.findByIdAndUpdate(
      userId,
      {
        password: await bcrypt.hash(password, 10),
      },
      {
        new: true,
      }
    );

    response.success(res, result, "success update password");
    try {
    } catch (error) {
      response.error(res, error, "failed to update password");
    }
  },

  async register(req: Request, res: Response) {
    const { fullName, username, email, password, confirmPassword } = req.body;

    try {
      await userDTO.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const existingUser = await UserModel.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return response.error(
          res,
          null,
          "email or username already registered"
        );
      }

      // Create User
      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      // Send Mail
      const contentMail = await renderMailHTML("registration-success.ejs", {
        username: result.username,
        fullName: result.fullName,
        email: result.email,
        createdAt: result.createdAt,
        activationLink: `${CLIENT_HOST}/auth/activation?code=${result.activationCode}`,
      });

      await sendMail({
        from: EMAIL_SMTP_USER,
        to: result.email,
        subject: "Aktivasi Akun Anda",
        html: contentMail,
      });

      response.success(res, result, "Register Successful!");
    } catch (error) {
      response.error(res, error, "Failed Registration");
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { identifier, password } = req.body;

      // validate login input
      await userLoginDTO.validate({
        identifier,
        password,
      });

      // ambil data user berdasarkan "identifier" -> email || username
      const userByIdentifier = await UserModel.findOne({
        $or: [
          {
            email: identifier,
          },
          {
            username: identifier,
          },
        ],
        isActive: true,
      });

      if (!userByIdentifier) {
        return response.unauthorized(res, "User not found");
      }

      // validasi password
      const validatePassword: boolean = await bcrypt.compare(
        password,
        userByIdentifier.password
      );

      if (!validatePassword) {
        return response.unauthorized(res, "Password not match");
      }

      // Generate Token
      const accessToken = generateAccessToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      // Generate and safe refresh token
      const refreshToken = generateRefreshToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      // console.log("LOGIN: Generated Refresh Token:", refreshToken); // Log the new token

      userByIdentifier.refreshToken = refreshToken;
      await userByIdentifier.save();

      // Manually refetch the user to confirm the save worked
      // const savedUser = await UserModel.findById(userByIdentifier._id).select(
      //   "+refreshToken"
      // );
      // console.log("LOGIN: Token in DB after save:", savedUser?.refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only https in prod and can use http (internal/localhost) in development
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        // path: "/api/auth/refresh",
      });

      // response.successWithCookie(
      //   res,
      //   { accessToken, refreshToken },
      //   "User found"
      // );
      response.success(res, { accessToken }, "User login successfuly");
    } catch (error) {
      response.error(res, error, "Login failed");
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "success get user profile");
    } catch (error) {
      response.error(res, error, "failed get user profile");
    }
  },

  async activation(req: Request, res: Response) {
    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        { activationCode: code },
        { isActive: true },
        { new: true } // update dilakukan sebelum return object user
      );

      if (!user) {
        return response.error(res, null, "Invalid activation code");
      }

      response.success(res, user, "successfully activate user account");
    } catch (error) {
      response.error(res, error, "failed activate user account");
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      // get token from cookie OR body
      // const token = req.cookies?.refreshToken || req.body?.token;
      const token = req.cookies?.refreshToken;
      // console.log("REFRESH: Token from cookie:", token);

      if (!token) return response.notFound(res, "no refresh token provided");

      const decoded = verifyRefreshToken(token);

      const user = await UserModel.findById(decoded.id);
      if (!user) return response.notFound(res, "user not found");

      // console.log("user after findById", user);

      // console.log("REFRESH: Token from DB:", user.refreshToken);

      if (user.refreshToken !== token) {
        console.error("TOKEN MISMATCH!");
        return response.unauthorized(res, "invalid refresh token");
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        role: user.role,
      });

      response.success(
        res,
        { accessToken: newAccessToken },
        "success refresh token"
      );
    } catch (error) {
      response.error(res, error, "invalid refresh token");
    }
  },
};
