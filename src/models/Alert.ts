import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: false,
      default: null, // ✅ Allow null for unknown visitors
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: false,
      default: null, // ✅ Allow null if not linked to a visit
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    detectedFloor: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["ok", "violation", "time_violation", "floor_violation"], // ✅ All valid alert types
      required: true,
      default: "violation",
    },
    photoDataUrl: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      default: "", // ✅ Optional explanation (e.g., "Time limit exceeded")
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: null, // ✅ Timestamp when alert is resolved
    },
  },
  { timestamps: true }
);

export default mongoose.models.Alert || mongoose.model("Alert", AlertSchema);
