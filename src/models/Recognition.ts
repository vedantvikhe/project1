import mongoose, { Schema, Document } from "mongoose";

export interface IRecognition extends Document {
  visitorId: mongoose.Types.ObjectId;
  visitId: mongoose.Types.ObjectId;
  detectedFloor: number;
  requestedFloor?: number;
  stationId?: mongoose.Types.ObjectId;
  type: "ok" | "violation";
  createdAt: Date;
}

const RecognitionSchema = new Schema<IRecognition>(
  {
    visitorId: { type: Schema.Types.ObjectId, ref: "Visitor", required: true },
    visitId: { type: Schema.Types.ObjectId, ref: "Visit" },
    detectedFloor: { type: Number, required: true },
    requestedFloor: Number,
    stationId: { type: Schema.Types.ObjectId, ref: "Station" },
    type: { type: String, enum: ["ok", "violation"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRecognition>(
  "Recognition",
  RecognitionSchema
);
