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
  
  @Entity({ name: "authors" })
  export class Author extends BaseEntity {
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

    @CreateDateColumn({ type: "datetime" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "datetime" })
    updated_at: Date;
  
    @DeleteDateColumn({ type: "datetime" })
    deleted_at: Date;

    // @OneToMany(() => Book, (book) => book.author, { onDelete: "CASCADE" })
    // books: Book[]



  //   @ManyToMany(() => Book, (book) => book.authors)
  // books: Book[]; // Kitabların siyahısı
  }
  