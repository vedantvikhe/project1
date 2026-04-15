import mongoose from "mongoose";

const DescriptorSchema = new mongoose.Schema(
  {
    data: { type: [Number], required: true }, // face embedding (128/512)
  },
  { _id: false }
);

const VisitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    idNumber: { type: String, required: false },
    photoDataUrl: { type: String, required: true }, // base64 preview
    descriptor: { type: DescriptorSchema, required: true }, // face descriptor
  },
  { timestamps: true }
);

// ✅ Fix OverwriteModelError for hot reloads
export default mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
