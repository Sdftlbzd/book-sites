import jwt from 'jsonwebtoken'
import "dotenv/config";
import { Author } from '../models/Author.model';
import { NextFunction, Request, Response } from 'express';
import { appConfig } from '../../consts';

// export const useAuth = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
//   if (
//     !req.headers.authorization ||
//     !req.headers.authorization.startsWith("Bearer")
//   ) {
//     return res.status(401).json({
//       message: "Token tapilmadi",
//     });
//   }

//   const access_token = req.headers.authorization.split(" ")[1];
//   if (!access_token)
//     return res.status(401).json({
//       message: "Token tapilmadi",
//     });

//   try {
//     const jwtResult = jwt.verify(access_token, 'secret');


//     const author = await Author.findOne({
//         where: { id: Number(jwtResult.sub) },
//  //       select: ["id","name"],
//  //       relations: ["book"]
//       })
    
//     if (!author) return res.status(401).json({ message: "User not found!" });

//     next(author);
//   } catch (error) {
//     return res.status(500).json({
//    //   message: error.message,
//       error,
//     });
//   }
// };

export const useAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log("token yoxdur")
   return next( res.status(401).json({
      message: "Token tapılmadı",
    }));
  }

  const access_token = String(authorizationHeader).split(" ")[1];
  if (!access_token) {
   return next(res.status(401).json({
      message: "Token tapılmadı",
    }));
  }

  try {
    // 3. Tokeni yoxlayırıq
   
    const jwtResult = jwt.verify(access_token, String(appConfig.JWT_SECRET)) as jwt.JwtPayload;

    const author = await Author.findOne({
      where: { id: Number(jwtResult.sub) }, // `sub` token payload-dan gəlir
    });

    if (!author) {
    return next( res.status(401).json({ message: "User not found!" }));
    }

    (req as any).author = author; // Custom məlumat əlavə etmək üçün req obyektini cast edirik
//req.author = author
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return next(res.status(401).json({
      message: "Token etibarsızdır",
      error,
    }));
  }
};
