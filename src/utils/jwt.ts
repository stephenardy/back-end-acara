import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "./env";
import { IUserToken } from "./interfaces";

// Access Token
export const generateAccessToken = (user: IUserToken): string => {
  const token = jwt.sign(user, ACCESS_SECRET, { expiresIn: "15m" });
  // const token = jwt.sign(user, ACCESS_SECRET, { expiresIn: "30s" });
  return token;
};

export const getUserData = (token: string) => {
  const user = jwt.verify(token, ACCESS_SECRET) as IUserToken;
  return user;
};

// Refresh Token
export const generateRefreshToken = (user: IUserToken): string => {
  const token = jwt.sign(user, REFRESH_SECRET, { expiresIn: "7d" });
  return token;
};

export const verifyRefreshToken = (token: string) => {
  const user = jwt.verify(token, REFRESH_SECRET) as IUserToken;
  return user;
};
