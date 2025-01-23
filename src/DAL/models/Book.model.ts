import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";
import { Author } from "./Author.model";
  
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
  
    @CreateDateColumn({ type: "datetime" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "datetime" })
    updated_at: Date;
  
    @DeleteDateColumn({ type: "datetime" })
    deleted_at: Date;

    @ManyToOne(()=>Author,(author)=>author.books)
    author:Author
  }
  