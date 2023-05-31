import { isPromise } from "util/types";
import { RequestHandler as ExpressRequestHandler, Request, NextFunction, Response } from "express";

type RequestHandler2<TParams = any, TResBody = any, TReqBody = any, TReqQuery = any> = (
  req: Request<TParams, TResBody, TReqBody, TReqQuery>,
  res: Response<TResBody>,
  next: NextFunction
) => Promise<void>;

export type RequestHandler<TParams = any, TResBody = any, TReqBody = any, TReqQuery = any> =
  | RequestHandler2<TParams, TResBody, TReqBody, TReqQuery>
  | ExpressRequestHandler<TParams, TResBody, TReqBody, TReqQuery>;

const handleError = (res: Response, error: unknown | Error) => {
  const e = error as Error;
  console.log(e);
  res.status(500);
  res.send({
    error: {
      name: e.name,
      message: e.message,
      stack: e.stack,
    },
  });
};

export const handlerWrapper = (handler: RequestHandler): ExpressRequestHandler => {
  const wrapper: RequestHandler = (req, res, next) => {
    try {
      const result = handler(req, res, next);
      if (isPromise(result)) {
        result.catch(err => handleError(res, err));
      }
      return result;
    } catch (err) {
      handleError(res, err);
    }
  };
  return wrapper;
};
