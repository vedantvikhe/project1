import mongoose from "mongoose";

const VisitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },
    requestedFloor: {
      type: Number,
      required: true,
      min: 1,
    },
    allowedDuration: {
      type: Number,
      required: true,
      min: 1,
      default: 30, // ✅ fallback if frontend forgets to send
    },
    entryTime: {
      type: Date,
      default: Date.now, // ✅ auto-set when visitor is registered
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

// ✅ Virtual field for expiry time
VisitSchema.virtual("expiryTime").get(function () {
  if (!this.entryTime || !this.allowedDuration) return null;
  return new Date(this.entryTime.getTime() + this.allowedDuration * 60000);
});

// ✅ Fix OverwriteModelError (important for tsx/nodemon reloads)
export default mongoose.models.Visit || mongoose.model("Visit", VisitSchema);
