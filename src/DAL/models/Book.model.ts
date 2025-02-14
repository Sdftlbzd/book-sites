import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User.model";
import { UserBookPurchase } from "./Order.model";

export enum EInquiryType {
  PARTNERSHIP = "PARTNERSHIP",
  INVESTMENT = "INVESTMENT",
  GENERAL = "GENERAL",
}

@Entity({ name: "books" })
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  title: string;

  @Column({ type: "varchar", length: 200 })
  description: string;

  @Column({ type: "int" })
  payMount: number;

  @Column({ type: "varchar", length: 50 })
  currency: string;

  @Column({ type: "int" })
  saleCount: number;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @DeleteDateColumn({ type: "datetime" })
  deleted_at: Date;

  @ManyToMany(() => User, (user) => user.createdBooks)
  authors: User[];

  @OneToMany(() => UserBookPurchase, (purchase) => purchase.book)
  purchases: UserBookPurchase[];
}
