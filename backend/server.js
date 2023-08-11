import express from "express";
import { PORT } from "./config/index.js";
import connectDB from "./database/database.js";
import router from "./router/index.js";
import errorHandler from "./middleWare/errorHandler.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
connectDB();
app.use(express.json());
app.use(router);
app.use("/storage", express.static("storage"));
app.use(errorHandler);
app.listen(PORT, console.log(`Server is running on PORT:${PORT}`));
