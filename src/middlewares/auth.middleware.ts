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

  try {
    const user = getUserData(token);
    (req as IReqUser).user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return response.tokenExpired(res, error);
    }

    return response.unauthorized(res, "Invalid Token");
  }
};
