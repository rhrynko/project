import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import database from "./config/db";
import userRouter from "./api/user";
import cors from "cors";

database();

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is dancing on http://localhost:${PORT}`);
});
