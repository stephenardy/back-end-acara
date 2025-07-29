import { Request } from "express";
import { Types } from "mongoose";
import { User } from "../models/user.model";

export interface IReqUser extends Request {
  user?: IUserToken;
}

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

export interface IPaginationQuery {
  page: number;
  limit: number;
  search?: string;
}
