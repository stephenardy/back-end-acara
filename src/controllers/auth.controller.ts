import { Request, Response } from "express";
import * as Yup from "yup";
import UserModel, {
  userDTO,
  userLoginDTO,
  userUpdatePasswordDTO,
} from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateAccessToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

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
    if (!user || user.password !== encrypt(oldPassword))
      return response.notFound(res, "user not found");

    const result = await UserModel.findByIdAndUpdate(
      userId,
      {
        password: encrypt(password),
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

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
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
      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthorized(res, "User not found");
      }

      // Generate Token
      const accessToken = generateAccessToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      response.success(res, accessToken, "User found");
    } catch (error) {
      response.error(res, error, "Login failed");
    }
  },

  async me(req: IReqUser, res: Response) {
    try {
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      response.success(res, result, "Success get user profile");
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

      response.success(res, user, "Successfully activate user account");
    } catch (error) {
      response.error(res, error, "failed activate user account");
    }
  },
};
