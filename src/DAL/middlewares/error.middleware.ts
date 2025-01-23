import { Request, Response } from "express";

export const handleErrors = (errors: any, req: Request, res: Response) => {
  if (errors) {
    res.status(400).json({
      message: "Validation failed",
      errors: errors.reduce((response: any, item: any) => {
        response[item.property] = Object.keys(item.constraints);
        return response;
      }, {}),
    });
  }
};