import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { Book } from "../../DAL/models/Book.model";
import { CreateBookDTO, UpdateBookDTO } from "./Book.dto";
import { In } from "typeorm";
import { ERoleType, User } from "../../DAL/models/User.model";
import { AuthRequest } from "../../types";
import { formatErrors } from "../../DAL/middlewares/error.middleware";

const Create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { title, description, authors, payMount, currency } = req.body;

    const author_list = await User.find({
      where: {
        id: In(authors),
      },
    });

    if (author_list.length === 0) {
      res.json("Muellif yoxdur");
      return;
    }

    console.log(author_list);

    const dto = new CreateBookDTO();

    dto.title = title;
    dto.description = description;
    dto.authors = author_list;
    dto.payMount = payMount;
    dto.currency = currency;

    const errors = await validate(dto);

    if (errors.length > 0) {
       res.status(400).json(formatErrors(errors));
      return;
    }

    const book = Book.create({
      title,
      description,
      authors: author_list, 
      payMount,
      currency,
    });

    const savedBook = await book.save();

    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the book",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const BookList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find({
      withDeleted: true,
      // relations: ["user"],
    });

    if (books.length === 0) {
      res.status(404).json({
        message: "No books found.",
      });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perpage) || 5;

    const before_page = (page - 1) * limit;
    const [list, total] = await Book.findAndCount({
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

const BookEdit = async (
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
    const id = Number(req.params.id);

    if (!id) {
      new Error("Id is required");
      return;
    }

    const { title, description, payMount, currency, authors } = req.body;
  
    const book = await Book.findOne({ where: { id }, relations: ["authors"] });

    if (!book) {
      new Error("Book not found");
      return;
    }
    
    const isAuthor = book.authors.some(author => author.id === user.id);

    if (!(isAuthor || ERoleType.ADMIN)) {
        res.json("Yalnız kitabın müəllifləri dəyişiklik edə bilər.");
        return
    }

    
    if (!Array.isArray(authors) || authors.length === 0) {
      res.status(400).json({ message: "Kitab ID-lərini düzgün göndərin" });
      return;
    }

    const author_list = await User.find({
      where: {
        id: In(authors),
      },
    });

    if (author_list.length === 0) {
      res.json("Muellif yoxdur");
      return;
    }

    const dto = new UpdateBookDTO();
    dto.title = title;
    dto.description = description;
    dto.payMount = payMount;
    dto.currency = currency;
    dto.authors = author_list;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(400).json(formatErrors(errors));
      return;
    }

      const update =
  (title &&(title !== book.title)) ||
  (description && (description !== book.description)) ||
  (payMount && (payMount !== book.payMount)) ||
  (author_list && (author_list.some(a => !book.authors.some(b => b.id === a.id)))) ||
  (currency && (currency !== book.currency));

    if (!update) {
      res.json({
        message: "No changes detected, book not updated.",
      });
      return;
    }


   await Book.update(id, {
      title,
      description,
      payMount,
      currency,
    });

    book.authors = author_list;
    await book.save(); 

    const updatedData = await Book.findOne({
      where: { id },
      select: [
        "id",
        "title",
        "description",
        "authors",
        "payMount",
        "currency",
        "updated_at",
      ],
    });

    res.json({
      message: "Book updated successfully",
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while update the book",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const BookDelete = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user

if(!user){
  res.json("User not found!")
  return
}

    const id = Number(req.params.id);
    if (!id) {
      new Error("Id is required");
      return;
    }

    const book = await Book.findOne({ where: { id }, relations: ["authors"] });

    if (!book) {
      new Error("Book not found");
      return;
    }
    
    const isAuthor = book.authors.some(author => author.id === user.id);

    if (!(isAuthor || ERoleType.ADMIN)) {
        res.json("Yalnız kitabın müəllifləri bu kitabi silə bilər.");
        return
    }

    await Book.softRemove(book);

    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json("An error occurred while deleting the book.");
  }
};

const GetById = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!id) {
    new Error("Id is required");
    return;
  }
  
  const data = await Book.findOne({
    where: { id },
    relations: ["authors","purchases"] ,
    select: ["id", "title", "created_at","authors"],
  });
  if (!data) {
    new Error("Book not found");
    return;
  }

  res.json({
  data,
    created_at: moment(data.created_at).format("YYYY-MM-DD HH:mm:ss"),
  });
};

export const BookController = () => ({
  Create,
  BookList,
  BookEdit,
  BookDelete,
  GetById,
});
