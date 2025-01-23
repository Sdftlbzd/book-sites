import { NextFunction, Request, Response } from "express";
import { Author } from "../../DAL/models/Author.model";
import { validate } from "class-validator";
import { CreateAuthorDTO } from "./Author.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { appConfig } from "../../consts";

const Register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, password } = req.body;

    const author = await Author.findOne({ where: { email: email } });
    if (author) return next(res.json("Bu emaile uygun muellif artiq movcuddur"));

    const newPassword = await bcrypt.hash(password, 10)

        const dto = new CreateAuthorDTO();
        dto.name = name;
        dto.surname = surname;
        dto.email = email;
        dto.password = newPassword;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(errors);
    }

    const newAuthor = Author.create({
      name,
      surname,
      email,
     password:newPassword,
    });
    const savedAuthor = await newAuthor.save();

    res.status(201).json(savedAuthor);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the author",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {

  const { email, password } = req.body;
  // 2. find user
  const author = await Author.findOne({
    where: { email: email } 
  });
  if (!author)
    return next (res.status(401).json({ message: "Email ve ya shifre sehvdir!" }))

 // 3. Check password
  const isValidPassword = await bcrypt.compare(
    password,
    author.password
  );

  if (!isValidPassword) {
    return next(res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    }))
  }
console.log(author.id)
  const jwt_payload = {
    sub: author.id,
  };
const jwtSecret = String(appConfig.JWT_SECRET)
  // 4. create jwt_token
  const new_token = jwt.sign(jwt_payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.json({
    access_token: new_token,
  });
};

export const AuthorController = () => ({
  Register,
  login
});
