import mongoose from "mongoose";

const { Schema } = mongoose;

const userTokenSchema = Schema(
  {
    userId: { type: String, requird: true },
    token: { type: String, required: true },
  },
  {
    timestamp: true,
  }
);
export default mongoose.model("RefreshToken", userTokenSchema, "token");
