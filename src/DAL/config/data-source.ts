import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "book_project",
  entities: ['src/DAL/models/**/*.ts'],
  subscribers: [],
  migrations: [],
  logging: false,
  synchronize: true,
});
