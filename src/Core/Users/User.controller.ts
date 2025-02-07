import { NextFunction, Request, Response } from "express";
import { validate } from "class-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { appConfig, userRoleList } from "../../consts";
import { CreateAuthorDTO, CreateUserDTO, EditUserDTO } from "./User.dto";
import { ERoleType, User } from "../../DAL/models/User.model";
import { Book } from "../../DAL/models/Book.model";
import { In } from "typeorm";
import { UpdateBookDTO } from "../Books/Book.dto";

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, password } = req.body;

    const user = await User.findOne({ where: { email: email } });
    if (user) return next(res.json("Bu emaile uygun user artiq movcuddur"));

    const newPassword = await bcrypt.hash(password, 10);

    const dto = new CreateUserDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = newPassword;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(
        res.status(400).json({
          message: "Validation failed",
          errors: errors.reduce((response: any, item: any) => {
            response[item.property] = Object.keys(item.constraints);
            return response;
          }, {}),
        })
      );
    }

    const newUser = User.create({
      name,
      surname,
      email,
      password: newPassword,
    });
    const savedUser = await newUser.save();

    const Data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "created_at"],
    });

    res.status(201).json(Data);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const registerAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, password, about } = req.body;

    const user = await User.findOne({ where: { email: email } });
    if (user) return next(res.json("Bu emaile uygun user artiq movcuddur"));

    const newPassword = await bcrypt.hash(password, 10);

    const dto = new CreateAuthorDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = newPassword;
    dto.about = about;
    dto.role = ERoleType.AUTHOR;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(
        res.status(400).json({
          message: "Validation failed",
          errors: errors.reduce((response: any, item: any) => {
            response[item.property] = Object.keys(item.constraints);
            return response;
          }, {}),
        })
      );
    }

    const newAuthor = User.create({
      name,
      surname,
      email,
      password: newPassword,
      about,
      role: ERoleType.AUTHOR,
    });
     await newAuthor.save();

    const Data = await User.findOne({
      where: { email },
      select: ["id", "name", "surname", "email", "created_at"],
    });

    res.status(201).json(Data);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  // 2. find user
  const user = await User.findOne({
    where: { email: email },
  });
  if (!user)
    return next(
      res.status(401).json({ message: "Email ve ya shifre sehvdir!" })
    );

  // 3. Check password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return next(
      res.status(401).json({
        message: "Email ve ya shifre sehvdir!",
      })
    );
  }
  console.log(user.id);
  const jwt_payload = {
    sub: user.id,
  };
  const jwtSecret = String(appConfig.JWT_SECRET);
  // 4. create jwt_token
  const new_token = jwt.sign(jwt_payload, jwtSecret, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  res.json({
    access_token: new_token,
  });
};

const AuthorBookList = async (req: Request, res: Response, next: NextFunction) => {
  try {    const user = (req as any).user;
    const list = await Book.find({
      withDeleted: true,
      where:{authors: user}
      // relations: ["user"],
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while displaying the book list",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const buyABook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { book_ids } = req.body; // 🔹 Artıq `book_id` deyil, `book_ids` (bir neçə kitab üçün array)

    if (!Array.isArray(book_ids) || book_ids.length === 0) {
      return next(res.status(400).json({ message: "Kitab ID-lərini düzgün göndərin" }));
    }

    // 🔹 ID-lərə əsasən kitabları tapırıq
    const books = await Book.findBy({
      id: In(book_ids),
    });

    if (books.length === 0) {
      return next(res.json({ message: "Seçilmiş kitab(lar) tapılmadı" }));
    }

    console.log("Tapılan kitablar:", books);

    // 🔹 İstifadəçinin mövcud alınmış kitablarını gətiririk
    const existingUser = await User.findOne({
      where: { id: user.id },
      relations: ["boughtBooks"], // ManyToMany əlaqəsini gətirmək üçün
    });

    if (!existingUser) return next(res.json({ message: "User tapılmadı" }));

    // 🔹 Artıq alınmış kitabları filtrləyirik (təkrar almağa ehtiyac olmasın)
    const newBooksToBuy = books.filter(
      (book) => !existingUser.boughtBooks.some((b) => b.id === book.id)
    );

    if (newBooksToBuy.length === 0) {
      return next(res.json({ message: "Siz artıq bu kitab(lar)ı almısınız" }));
    }

    // 🔹 Yeni kitabları istifadəçinin `boughtBooks` arrayinə əlavə edirik
    existingUser.boughtBooks.push(...newBooksToBuy);
    await existingUser.save(); // Dəyişiklikləri yadda saxlayırıq

    const dto = new EditUserDTO();
    dto.boughtBooks = books;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(
        res.status(400).json({
          message: "Validation failed",
          errors: errors.reduce((response: any, item: any) => {
            response[item.property] = Object.keys(item.constraints);
            return response;
          }, {}),
        })
      );
    }

    // 🔹 Kitabı `boughtBooks` arrayinə əlavə edirik
    existingUser.boughtBooks.push(...books);
    await existingUser.save(); // Dəyişiklikləri yadda saxlayırıq

    // 🔹 Satış sayını artırırıq
    for (const book of newBooksToBuy) {
      await Book.update(book.id, {
        saleCount: book.saleCount + 1,
      });
    }

    res.json({
      message: "Books purchased successfully",
      data: {
        id: existingUser.id,
        name: existingUser.name,
        surname: existingUser.surname,
        boughtBooks:books
      },
    });
  } catch (error) {
    console.error("Xəta baş verdi:", error);
    res.status(500).json({
      message: "An error occurred while purchasing the books",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const UserController = () => ({
  registerUser,
  registerAuthor,
  AuthorBookList,
  login,
  buyABook
});
