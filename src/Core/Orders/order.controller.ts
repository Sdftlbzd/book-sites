import { NextFunction, Request, Response } from "express";
import { User } from "../../DAL/models/User.model";
import { Book } from "../../DAL/models/Book.model";
import { In } from "typeorm";
import { AuthRequest } from "../../types";
import { UserBookPurchase } from "../../DAL/models/Order.model";

const buyABook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { book_ids } = req.body; 

    if(!user){
        res.json("User not found!")
        return
    }

    if (!Array.isArray(book_ids) || book_ids.length === 0) {
      res.status(400).json({ message: "Kitab ID-lərini düzgün göndərin" });
      return;
    }

    const books = await Book.findBy({
      id: In(book_ids),
    });

    if (books.length === 0) {
      res.json({ message: "Seçilmiş kitab(lar) tapılmadı" });
      return;
    }

    const existingUser = await User.findOne({
      where: { id: user.id },
      relations: ["purchases"], 
    });

    if (!existingUser) {
      res.json({ message: "User tapılmadı" });
      return;
    }

const newPurchases = books.map((book) => {
    const purchase = new UserBookPurchase();
    purchase.user = existingUser; 
    purchase.book = book; 
    purchase.purchaseDate = new Date(); 
    
    return purchase; 
  });
  
  await UserBookPurchase.save(newPurchases); 

    for (const book of books) {
      await Book.update(book.id, {
        saleCount: book.saleCount + 1,
      });
    }

    await User.update(user.id, {
        bookCount: user.bookCount +books.length ,
      });

    res.json({
      message: "Books purchased successfully",
      data: {
        id: existingUser.id,
        name: existingUser.name,
        surname: existingUser.surname,
        purchases: books,
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

const bookSaleList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perpage) || 10;
    const before_page = (page - 1) * limit;

    const [books, total] = await Book.findAndCount({
      withDeleted: true,
      order: { saleCount: "DESC" }, 
      skip: before_page,
      take: limit,
    });

    if (books.length === 0) {
      res.status(404).json({ message: "No books found." });
      return;
    }

    res.status(200).json({
      data: books,
      pagination: {
        books: total,
        currentPage: page,
        messagesCount: books.length,
        allPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const OrderController = () => ({
    buyABook,
    bookSaleList
  });