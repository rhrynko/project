import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export default async function connect() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
}
