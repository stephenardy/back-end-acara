import { NextFunction, Request, Response } from "express";
import response from "../utils/response";

// Global Error Handling

export default {
  // for route
  serverRoute() {
    return (req: Request, res: Response, next: NextFunction) => {
      response.notFound(res, "route not found");
    };
  },

  //   for other 500 internal server error
  serverError() {
    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      response.error(res, err, err.message);
    };
  },
};
