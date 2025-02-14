import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { appConfig } from "../../consts";
import { CreateUserDTO, EditUserDTO } from "./User.dto";
import { ERoleType, User } from "../../DAL/models/User.model";
import { Book } from "../../DAL/models/Book.model";
import { In } from "typeorm";
import { AuthRequest } from "../../types";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, surname, email, password, about, role } = req.body;

    const user = await User.findOne({ where: { email: email } });
    if (user) {
      res.json("Bu emaile uygun user artiq movcuddur");
      return;
    }

    const newPassword = await bcrypt.hash(password, 10);

    const dto = new CreateUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = newPassword;
    dto.about = about;
    dto.role = role;

    const errors = await validate(dto);


    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.reduce((response: any, item: any) => {
          response[item.property] = Object.keys(item.constraints);
          return response;
        }, {}),
      });
      return;
    }

    const newUser = User.create({
      name,
      surname,
      email,
      password: newPassword,
      role
    });


 if (role === ERoleType.AUTHOR) {
  newUser.about = about;
}

await newUser.save();

    const Data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "role", "created_at"],
    });

    res.status(201).json(Data);
    next()
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email: email },
  });

  if (!user) {
    res.status(401).json({ message: "Email ve ya shifre sehvdir!" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    });
    return;
  }

  const jwt_payload = {
    sub: user.id,
  };
  const jwtSecret = String(appConfig.JWT_SECRET);

  const new_token = jwt.sign(jwt_payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.json({
    access_token: new_token,
  });
};

const AuthorBooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    const id = Number(req.params.id);

    if (!id) {
      res.json("User not found");
      return;
    }

    const user = await User.findOne({
      where: {
        id,
      },
      relations:["createdBooks"]
    });

    if (!user) {
      res.status(404).json({
        message: "Books not found.",
      });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perpage) || 5;
    
    const books = user.createdBooks

    const book_ids = books.map(book => book.id)

    if(!book_ids){
      res.json("Bu muellife uygun kitablar yoxdur")
    }

    const before_page = (page - 1) * limit;
    const [list, total] = await Book.findAndCount({
      where:{id: In(book_ids)},
      skip: before_page,
      take: limit,
    });

    res.status(200).json({
      data: list,
      pagination: {
        books: total,
        currentPage: page,
        messagesCount: list.length,
        allPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while displaying the book list",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userEdit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      res.json("User not found");
      return;
    }

    const id = user.id;

    const {
      name,
      surname,
      email,
      password,
      about,
    } = req.body;

    const dto = new EditUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = password;
    dto.about = about;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(400).json({
        message: "Validation failed",
        errors: errors.reduce((response: any, item: any) => {
          response[item.property] = Object.keys(item.constraints);
          return response;
        }, {}),
      });
      return;
    }

  await User.update(id, {
      name,
      surname,
      email,
      password,
    });

    if (user.role === ERoleType.AUTHOR) {
      await User.update(id,
        { about,
      })
    }

    const updatedData = await User.findOne({
      where: { id },
      select: ["id", "name", "surname", "email", "updated_at"],
    });

    res.json({
      message: "User updated successfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while update the book",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userDelete = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.json("Bele bir user yoxdur");
      return;
    }

    user.softRemove();

    res.json({ message: "User uğurla silindi!" });
  } catch (error) {
    console.error("Error removing user:", error);
    res.status(500).json("An error occurred while removing the user.");
  }
};

export const UserController = () => ({
  register,
  login,
  userEdit,
  userDelete,
  AuthorBooks,
});
