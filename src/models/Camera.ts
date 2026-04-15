import mongoose, { Schema, Document } from "mongoose";

export interface ICamera extends Document {
  stationName: string;
  floor: number;
  isActive: boolean;
  lastHeartbeat?: Date;
}

const CameraSchema = new Schema<ICamera>(
  {
    stationName: { type: String, required: true },
    floor: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    lastHeartbeat: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ICamera>("Camera", CameraSchema);
