import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { Book } from "../../DAL/models/Book.model";
import { CreateBookDTO, UpdateBookDTO } from "./Book.dto";
import { In } from "typeorm";
import { ERoleType, User } from "../../DAL/models/User.model";
import { AuthRequest } from "../../types";

const Create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { title, description, authors, payMount, currency } = req.body;

    // 🔹 Müəllifləri ID-lər əsasında tapırıq
    const author_list = await User.find({
      where: {
        id: In(authors),
      },
    });

    if (author_list.length === 0) return next(res.json("Muellif yoxdur"));
    
    console.log(author_list);

    const dto = new CreateBookDTO();

    dto.title = title;
    dto.description = description;
    dto.authors = author_list;
    dto.payMount = payMount;
    dto.currency = currency;

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

    // 🔹 Kitab yaradıb müəllifləri əlavə edirik
    const book = Book.create({
      title,
      description,
      authors: author_list,  // ✅ Düzgün obyekt ötürülməsi
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
    const list = await Book.find({
      withDeleted: true,
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

const BookEdit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if(!user) {res.json("User not found") 
      return}
    const id = Number(req.params.id);

    if (!id) return next(new Error("Id is required"));

    const { title, description, payMount, currency } = req.body;

    const book = await Book.findOne({ where: { id }, relations: ["user"] });

    if (!book) return next(new Error("Book not found"));

    if (user.role === ERoleType.USER)
      return next(res.json("Sizin update icazeniz yoxdur"));

    if (user.role === ERoleType.AUTHOR) {
    const books = Book.find({
        where:{authors:user},
    })
    return next(res.json(books))
    }

    const dto = new UpdateBookDTO();
    dto.title = title;
    dto.description = description;
    dto.payMount = payMount;
    dto.currency = currency;

    const errors = await validate(dto);

    if (errors.length > 0) return next(
      res.status(400).json({
        message: "Validation failed",
        errors: errors.reduce((response: any, item: any) => {
          response[item.property] = Object.keys(item.constraints);
          return response;
        }, {}),
      }));

    const update =
      title !== (book.title && undefined) ||
      description !== (book.description && undefined) ||
      payMount !== (book.payMount && undefined) ||
      currency !== (book.currency && undefined);

    if (!update) {
      return next(
        res.json({
          message: "No changes detected, book not updated.",
          data: book,
        })
      );
    }

    await Book.update(id, {
      title,
      description,
      payMount,
      currency,
    });

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

const BookDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!id) return next(new Error("Id is required"));

    const book = await Book.findOne({ where: { id } });

    if (!book) return next(res.status(404).json("Book not found."));

    await Book.softRemove(book);

    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json("An error occurred while deleting the book.");
  }
};

const GetById = async (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!id) return next(new Error("Id is required"));

  const data = await Book.findOne({
    where: { id },
    select: ["id", "title", "created_at"],
  });
  if (!data) return next(new Error("Book not found"));

  res.json({
    ...data,
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
