import mongoose, { Schema, model, models } from "mongoose";

export type NotificationType = "follow" | "new_reel" | "new_story" | "like" | "comment";

export interface INotification {
  _id?: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: NotificationType;
  reelId?: mongoose.Types.ObjectId;
  storyId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "new_reel", "new_story", "like", "comment"], required: true },
    reelId: { type: Schema.Types.ObjectId, ref: "Video", default: null },
    storyId: { type: Schema.Types.ObjectId, ref: "Story", default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast queries by recipient
notificationSchema.index({ recipientId: 1, createdAt: -1 });

const Notification = models?.Notification || model<INotification>("Notification", notificationSchema);
export default Notification;
