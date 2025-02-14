import { Entity, ManyToOne, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { User } from "./User.model";
import { Book } from "./Book.model";

@Entity("user_bought_books") // Cədvəlin adı
export class UserBookPurchase extends BaseEntity  {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.purchases)
  user: User;

  @ManyToOne(() => Book, (book) => book.purchases)
  book: Book;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }) // Satınalma tarixi
  purchaseDate: Date;
}
