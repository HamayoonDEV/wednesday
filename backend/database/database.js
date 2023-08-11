import mongoose from "mongoose";
import { DATABASE_CONNECTION } from "../config/index.js";

const connectDB = async () => {
  try {
    const con = await mongoose.connect(DATABASE_CONNECTION);
    console.log(`Database is connected to the host:${con.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};
export default connectDB;
