import express from "express";
import controller from "../controller/authController.js";
import auth from "../middleWare/auth.js";
import blogController from "../controller/blogController.js";

const router = express.Router();
//auth Routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", auth, controller.logout);
router.get("/refresh", controller.refresh);

//blog Routes
router.post("/createblog", auth, blogController.createBlog);

export default router;
