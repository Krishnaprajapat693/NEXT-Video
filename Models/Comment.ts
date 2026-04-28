import mongoose, { Schema, model, models } from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  text: string;
  createdAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

commentSchema.index({ videoId: 1, createdAt: -1 });

const Comment = models?.Comment || model<IComment>("Comment", commentSchema);
export default Comment;
