import mongoose, { Schema, model, models } from "mongoose";

export interface IStory {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  expiresAt: Date;
  createdAt?: Date;
}

const storySchema = new Schema<IStory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption: { type: String, default: "" },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

// TTL index — MongoDB auto-deletes the document after expiresAt
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = models?.Story || model<IStory>("Story", storySchema);
export default Story;
