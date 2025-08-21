import crypto from "crypto";
import { ACCESS_SECRET } from "./env";

export const encrypt = (password: string): string => {
  const encrypted = crypto
    .pbkdf2Sync(password, ACCESS_SECRET, 1000, 64, "sha512")
    .toString("hex");

  return encrypted;
};
