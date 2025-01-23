import express from "express";
import { v1Routes } from "./Routes";
import "reflect-metadata";
import { AppDataSource } from "./DAL/config/data-source";
import { handleErrors } from "./DAL/middlewares/error.middleware";

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");

    const app = express();

    app.use(express.json());

    app.use("/api/v1", v1Routes);

    app.use(handleErrors);

    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  })
  .catch((error) => {
    console.error("Error connecting to database", error);
  });
