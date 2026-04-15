import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";

import visitors from "./routes/visitors";
import stations from "./routes/stations";
import recognitions from "./routes/recognitions";
import dashboardRoutes from "./routes/dashboardRoutes";
import { initWS } from "./ws";
import Visit from "./models/visit"; // ✅ for auto-expiry cleanup
import authRoutes from "./routes/authRoutes";



const app = express();
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/visitors", visitors);
app.use("/api/stations", stations);
app.use("/api/recognitions", recognitions);
app.use("/api/dashboard", dashboardRoutes);

const server = http.createServer(app);
initWS(server); // ✅ Setup WebSocket connections

const PORT = Number(process.env.PORT || 4000);

// 🟢 Connect MongoDB & start server
mongoose.connect(process.env.MONGODB_URI as string).then(() => {
  server.listen(PORT, () =>
    console.log(`✅ API listening on http://localhost:${PORT}`)
  );
});

// 🕒 Auto-expire visits every minute
setInterval(async () => {
  const now = new Date();
  try {
    const expired = await Visit.updateMany(
      {
        status: "active",
        $expr: {
          $lt: [
            { $add: ["$entryTime", { $multiply: ["$allowedDuration", 60000] }] },
            now,
          ],
        },
      },
      { $set: { status: "completed" } }
    );

    if (expired.modifiedCount > 0) {
      console.log(`🕒 Auto-closed ${expired.modifiedCount} expired visits.`);
    }
  } catch (err) {
    console.error("❌ Visit expiry check failed:", err);
  }
}, 60 * 1000); // every 1 minute
