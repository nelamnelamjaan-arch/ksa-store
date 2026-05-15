import mongoose from "mongoose";

export const ADMIN_NOTIFICATION_TYPES = Object.freeze({
  SOURCE_UNAVAILABLE: "source_unavailable",
});

const adminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(ADMIN_NOTIFICATION_TYPES),
      required: true,
    },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    message: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ createdAt: -1 });

export const AdminNotification =
  mongoose.models.AdminNotification ||
  mongoose.model("AdminNotification", adminNotificationSchema);
