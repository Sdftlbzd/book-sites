import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Book } from "./Book.model";

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

  @Column({ type: "text"})
  about: string;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime" })
  deleted_at: Date;

  // @OneToMany(() => Book, (book) => book.author, { onDelete: "CASCADE" })
  // books: Book[]

 /* @ManyToMany(() => Book, (book) => book.authors)
  books: Book[]; // Kitabların siyahısı

  @ManyToMany(() => Book, (book) => book.users)
  receivedBook: Book[]; // Kitabların siyahısı*/

  // ✍️ Yaratdığı kitablar (Authors üçün ManyToMany)
  @ManyToMany(() => Book, (book) => book.authors)
  @JoinTable({ name: "user_created_books" })  // 🔹 Müxtəlif JoinTable adı
  createdBooks: Book[];

  // 🛒 Satın aldığı kitablar (Bütün istifadəçilər üçün ManyToMany)
  @ManyToMany(() => Book, (book) => book.buyers)
  @JoinTable({ name: "user_bought_books" })  // 🔹 Müxtəlif JoinTable adı
  boughtBooks: Book[];
}
