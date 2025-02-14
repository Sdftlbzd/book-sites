import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Book } from "./Book.model";
import { UserBookPurchase } from "./Order.model";

export enum ERoleType {
  USER = "USER",
  ADMIN = "ADMIN",
  AUTHOR = "AUTHOR",
}

export enum EStatusType {
  ACTIVE = "ACTIVE",
  DEACTIVE = "DEACTIVE",
}

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 150 })
  surname: string;

  @Column({ type: "varchar", length: 150 })
  email: string;

  @Column({ type: "varchar", length: 100 })
  password: string;

  @Column({
    type: "enum",
    enum: ERoleType,
    default: ERoleType.USER,
  })
  role: ERoleType;

  @Column({
    type: "enum",
    enum: EStatusType,
    default: EStatusType.ACTIVE,
  })
  status: EStatusType;

  @Column({ type: "text" })
  about: string;

  @Column({ type: "int" })
  bookCount: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime" })
  deleted_at: Date;

  @ManyToMany(() => Book, (book) => book.authors)
  @JoinTable({ name: "user_created_books" })
  createdBooks: Book[];

  @OneToMany(() => UserBookPurchase, (purchase) => purchase.user)
  purchases: UserBookPurchase[];
}
