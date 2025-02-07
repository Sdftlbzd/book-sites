// interface IUser {
//     id: number;
//     name: string;
// }

// declare global {
//     namespace Express {
//         interface Request {
//             user: IUser; 
//         }
//     }
// }

import { Request } from "express";
import { userRoleList } from "../consts";

export interface IUser {
    id: number;
    name: string;
    role:userRoleList
}

export interface AuthRequest extends Request {
    user?: IUser;
}