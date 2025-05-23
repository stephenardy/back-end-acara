import jwt from "jsonwebtoken";
import { SECRET } from "./env";
import { User } from "../models/user.model";
import { Types } from "mongoose";

// exclude unimportant data (tinggal role sama id)
export interface IUserToken
  extends Omit<
    User,
    | "password"
    | "isActive"
    | "activationCode"
    | "email"
    | "fullName"
    | "username"
    | "profilePicture"
  > {
  id?: Types.ObjectId; // ambil id juga
}

export const generateAccessToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET, { expiresIn: "15m" });
  return token;
};

export const getUserData = (token: string) => {
  const user = jwt.verify(token, SECRET) as IUserToken;
  return user;
};
