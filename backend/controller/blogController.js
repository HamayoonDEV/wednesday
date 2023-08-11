import Joi from "joi";
import fs from "fs";
import Blog from "../models/blog.js";
import { BACKEND_SERVER_PATH } from "../config/index.js";
import BlogDTO from "../DTO/blogDTO.js";

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  //create blog
  async createBlog(req, res, next) {
    //creating blog schema using joi
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongoIdPattern).required(),
      photo: Joi.string().required(),
    });
    const { error } = createBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { title, content, photo, author } = req.body;
    //handle photo
    //read as buffer
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );
    //alot random names
    const imagePath = `${Date.now()}-${author}.png`;
    //save locally
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }
    //save database
    let blog;
    try {
      const newBlog = new Blog({
        title,
        content,
        author,
        photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });
      blog = await newBlog.save();
    } catch (error) {
      return next(error);
    }
    const blogDto = new BlogDTO(blog);
    //sending respose
    res.status(201).json({ blog: blogDto });
  },
};
export default blogController;
