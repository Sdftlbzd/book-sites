import { Request } from "express";
import { User } from "../DAL/models/User.model";

export interface IUser extends User {
    id: number;
    name: string;
}

export interface AuthRequest extends Request {
    user?: IUser;
}