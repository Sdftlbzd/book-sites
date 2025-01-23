interface IUser {
    id: number;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            user: IUser; 
        }
    }
}