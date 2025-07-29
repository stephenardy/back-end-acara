import { NextFunction, Request, Response } from "express";
import { getUserData } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    return response.unauthorized(res);
  }

  const [prefix, token] = authHeader.split(" ");

  if (!(prefix === "Bearer" && token)) {
    return response.unauthorized(res);
  }

  const user = getUserData(token);

  if (!user) {
    return response.unauthorized(res);
  }

  (req as IReqUser).user = user;
  next();
};
