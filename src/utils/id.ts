// Untuk generate id order (sebenarnya mongodb udah sediain id, cuma supaya mudah dibaca maka kita generate manual)

import { customAlphabet } from "nanoid";

export const getId = (): string => {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
  return nanoid(5); // 5 characters
};
