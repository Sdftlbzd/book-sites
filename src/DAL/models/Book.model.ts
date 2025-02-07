import {
    BaseEntity,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from "typeorm";
import { User } from "./User.model";
  
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

    @Column({ type: "int"})
    payMount: number;

    @Column({ type: "varchar", length: 50 })
    currency: string;

    @Column({ type: "int"})
    saleCount: number;
  
    @CreateDateColumn({ type: "datetime" })
    created_at: Date;
  
    @UpdateDateColumn({ type: "datetime" })
    updated_at: Date;
  
    @DeleteDateColumn({ type: "datetime" })
    deleted_at: Date;

    // @ManyToOne(()=>Author,(author)=>author.books,{cascade:true})
    // author:Author

        // @ManyToMany(() => Author)
        // @JoinTable()
        // books: Book[]


  // @ManyToMany(() => Author, (author) => author.books, { cascade: true })
  // @JoinTable()
  // authors: Author[]; // Müəlliflərin siyahısı

  /*@ManyToMany(() => User, (author) => author.books, { cascade: true })
  @JoinTable({name:"BookAuthor"})
  authors: User[]; // Müəlliflərin siyahısı

  @ManyToMany(() => User, (user) => user.receivedBook, { cascade: true })
  @JoinTable({name:"BookUser"})
  users: User[]; */
  // ✍️ Kitabı yaradan müəlliflər (Authors üçün ManyToMany)
  @ManyToMany(() => User, (user) => user.createdBooks)
  authors: User[];

  // 🛒 Kitabı satın alan istifadəçilər (Bütün istifadəçilər üçün ManyToMany)
  @ManyToMany(() => User, (user) => user.boughtBooks)
  buyers: User[];
  }
  