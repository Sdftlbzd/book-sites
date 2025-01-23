import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";
import moment from "moment";
import { Book } from "../../DAL/models/Book.model";
import { CreateBookDTO, UpdateBookDTO } from "./Book.dto";

const Create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = (req as any).author;
    const { title, description } = req.body;

    const authorId = author.id;

    const dto = new CreateBookDTO();
    dto.title = title;
    dto.description = description;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(errors);
    }

    const book = Book.create({
      author: author,
      title,
      description,
    });

    const savedBook = await book.save();

    //res.status(201).json(savedBook);
    res.status(201).json({ book: savedBook, author: savedBook.author });
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
      relations: ["author"],
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while displaying the book list",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const BookEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!id) return next(new Error("Id is required"));

    const { title, description } = req.body;

    const book = await Book.findOne({ where: { id }, relations: ["user"] });

    if (!book) return next(new Error("Book not found"));

    const dto = new UpdateBookDTO();
    dto.title = title;
    dto.description = description;

    const errors = await validate(dto);

    if (errors.length > 0) return next(errors);

    const update = book.title !== title || book.description !== description;

    if (!update) {
      return next(
        res.json({
          message: "No changes detected, contact not updated.",
          data: book,
        })
      );
    }

    await Book.update(id, {
      title,
      description,
    });

    const updatedData = await Book.findOne({
      where: { id },
      select: ["id", "title", "created_at"],
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
