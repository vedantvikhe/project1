import mongoose from "mongoose";

const StationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floor: { type: Number, required: true },
  token: { type: String, required: true, unique: true } // simple bearer for mobile station
}, { timestamps: true });

export default mongoose.model("Station", StationSchema);
