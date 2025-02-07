import jwt from "jsonwebtoken";
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { appConfig, userRoleList } from "../../consts";
import { EStatusType, User } from "../models/User.model";
import { AuthRequest } from "../../types";

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

export const useAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    console.log("token yoxdur");
      res.status(401).json({
        message: "Token tapılmadı",
      })
      return
    
  }

  const access_token = String(authorizationHeader).split(" ")[1];
  if (!access_token) {
      res.status(401).json({
        message: "Token tapılmadı",
      })
    return
  }

  try {
    // 3. Tokeni yoxlayırıq

    const jwtResult = jwt.verify(
      access_token,
      String(appConfig.JWT_SECRET)
    ) as jwt.JwtPayload;

    const user = await User.findOne({
      where: { id: Number(jwtResult.sub) }, // `sub` token payload-dan gəlir
    });

    if (!user) {
     res.status(401).json({ message: "User not found!" });
      return
    }

    //(req as any).user = user; // Custom məlumat əlavə etmək üçün req obyektini cast edirik
    req.user = user
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
      res.status(401).json({
        message: "Token etibarsızdır",
        error,
      })
  return
  }
};

// export const roleCheck = (role:[String]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const user = (req as any).user;

//     const userRole = user.role;

//     if (!role.includes(userRole)) {
//       return res.status(403).json("Bu emeliyyat üçün icazeniz yoxdur!");
//     }

//     if (user.status === EStatusType.DEACTIVE) {
//       return res.json("Siz active user deyilsiniz!!!");
//     }

//     next();
//   };
// };


export const roleCheck=  (  roles:string[]):any => {
  return (req: Request,
  res: Response,
  next: NextFunction)=>{
 
    const user = (req as any).user;

    if (!user) {
      return next(res.status(401).json({ message: "İstifadəçi tapılmadı!" }));
    }

    if (!roles.includes(user.role)) {
      return next(res.status(403).json({ message: "İcazəniz yoxdur!" }));
    }

    next(); // Bu vacibdir, əks halda funksiya dayanacaq
  };
}
