import mongoose from "mongoose";

const { Schema } = mongoose;

const blogSchema = new Schema(
  {
    content: { type: String, required: true },
    title: { type: String, requird: true },
    photopath: { type: String, required: true },
    author: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Blog", blogSchema, "blogs");
