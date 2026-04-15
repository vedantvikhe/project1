import { Router, Request, Response } from "express";
import Visitor from "../models/visitor";
import Visit from "../models/visit";

const router = Router();

/**
 * 🧾 POST /api/visitors
 * Registers a new visitor + creates a visit entry.
 * Requires:
 *  - name, phone, requestedFloor, allowedDuration, photoDataUrl, descriptor.data
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      idNumber,
      requestedFloor,
      allowedDuration,
      photoDataUrl,
      descriptor,
    } = req.body;

    // 🧩 Basic validation
    if (!name || !phone || !requestedFloor || !photoDataUrl || !descriptor?.data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!allowedDuration || isNaN(allowedDuration) || allowedDuration <= 0) {
      return res.status(400).json({
        error: "Allowed duration (in minutes) is required and must be greater than 0",
      });
    }

    // 👤 Create a visitor record
    const visitor = await Visitor.create({
      name,
      phone,
      idNumber: idNumber || "",
      photoDataUrl,
      descriptor: { data: descriptor.data },
    });

    // 🕒 Create a visit record (track time)
    const visit = await Visit.create({
  visitorId: visitor._id,
  requestedFloor: Number(requestedFloor), // ✅ ensure numeric
  allowedDuration: Number(allowedDuration), // ✅ ensure numeric
  entryTime: new Date(),
  status: "active",
});


    res.json({ visitor, visit });
  } catch (e: any) {
    console.error("❌ Visitor registration error:", e);
    res.status(500).json({ error: e.message || "Internal server error" });
  }
});

/**
 * 🟢 GET /api/visitors/active
 * Returns all currently active visits with visitor details populated.
 */
router.get("/active", async (_req: Request, res: Response) => {
  try {
    const visits = await Visit.find({ status: "active" }).populate("visitorId");
    res.json(visits);
  } catch (err: any) {
    console.error("❌ Failed to fetch active visits:", err);
    res.status(500).json({ error: "Failed to fetch active visits" });
  }
});

export default router;
