// import { Router, Request, Response, NextFunction } from "express";
// import Station from "../models/Station";
// import Visit from "../models/visit";
// import Alert from "../models/Alert";
// import { euclidean } from "../utils/distance.js";
// import { FACE_MATCH_THRESHOLD } from "../utils/validate.js";
// import { pushAlert } from "../ws.js";

// const router = Router();

// /* 🔒 Station authentication middleware */
// async function stationAuth(req: Request, res: Response, next: NextFunction) {
//   try {
//     const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
//     if (!token) return res.status(401).json({ error: "Missing station token" });

//     const station = await Station.findOne({ token });
//     if (!station) return res.status(401).json({ error: "Invalid station token" });

//     (req as any).station = station;
//     next();
//   } catch (err: any) {
//     console.error("Station auth error:", err.message || err);
//     res.status(500).json({ error: "Internal server error during station auth" });
//   }
// }

// /* 🚀 POST /api/recognitions — Face recognition + validation */
// router.post("/", stationAuth, async (req: Request, res: Response) => {
//   try {
//     const station = (req as any).station;
//     const descriptor: number[] = req.body?.descriptor?.data;
//     const photoDataUrl: string = req.body?.photoDataUrl || "";

//     if (!Array.isArray(descriptor)) {
//       return res.status(400).json({ error: "Descriptor missing or invalid" });
//     }

//     // 🔍 Find best face match among active visits
//     const activeVisits = await Visit.find({ status: "active" }).populate("visitorId");
//     let best: { visit: any; dist: number } | null = null;

//     for (const v of activeVisits) {
//       const visitorDesc = (v.visitorId as any)?.descriptor?.data;
//       if (!visitorDesc) continue;
//       const d = euclidean(descriptor, visitorDesc);
//       if (!best || d < best.dist) best = { visit: v, dist: d };
//     }

//     // ❌ Unknown person (no match)
//     if (!best || best.dist > FACE_MATCH_THRESHOLD) {
//       const detectedFloor = station.floor;

//       const unknownAlert = await Alert.create({
//         visitorId: null,
//         visitId: null,
//         detectedFloor,
//         stationId: station._id,
//         type: "violation",
//       });

//       pushAlert({
//         alertId: unknownAlert._id.toString(),
//         visitor: { name: "Unknown", phone: "", photoDataUrl },
//         requestedFloor: null as any,
//         detectedFloor,
//         type: "violation",
//         createdAt: unknownAlert.createdAt,
//       });

//       console.log(`🚨 Unknown person detected on floor ${detectedFloor}`);
//       return res.json({ matched: false, type: "violation", detectedFloor });
//     }

//     // ✅ Known visitor
//     const visit = best.visit;
//     const requestedFloor = visit.requestedFloor;
//     const detectedFloor = station.floor;

//     // 🕒 Time and floor validation
//     const now = new Date();
//     const entryTime = new Date(visit.entryTime);
//     const expiryTime = new Date(entryTime.getTime() + visit.allowedDuration * 60000);

//     let type = "ok";
//     let reason = "";

//     if (now > expiryTime) {
//       type = "time_violation";
//       reason = "Allowed duration exceeded";
//     } else if (detectedFloor !== requestedFloor) {
//       type = "floor_violation";
//       reason = "Visitor on incorrect floor";
//     }

//     // 🚨 Create alert only for violations
//     if (type !== "ok") {
//       const alert = await Alert.create({
//         visitorId: (visit.visitorId as any)._id,
//         visitId: visit._id,
//         detectedFloor,
//         stationId: station._id,
//         type,
//         reason,
//       });

//       pushAlert({
//         alertId: alert._id.toString(),
//         visitor: {
//           name: (visit.visitorId as any).name,
//           phone: (visit.visitorId as any).phone,
//           photoDataUrl: (visit.visitorId as any).photoDataUrl,
//         },
//         requestedFloor,
//         detectedFloor,
//         type,
//         createdAt: alert.createdAt,
//         reason,
//       });

//       console.log(
//         type === "time_violation"
//           ? `⏰ Time Violation: ${(visit.visitorId as any).name} exceeded allowed stay time`
//           : `🚨 Floor Violation: ${(visit.visitorId as any).name} detected on wrong floor`
//       );
//     } else {
//       // ✅ Correct visitor, correct floor, within time
//       console.log(`✅ ${(visit.visitorId as any).name} validated correctly on floor ${detectedFloor}`);

//       // Send transient success event to dashboard (not stored in DB)
//       pushAlert({
//         alertId: "none",
//         visitor: {
//           name: (visit.visitorId as any).name,
//           phone: (visit.visitorId as any).phone,
//           photoDataUrl: (visit.visitorId as any).photoDataUrl,
//         },
//         requestedFloor,
//         detectedFloor,
//         type: "ok",
//         createdAt: new Date(),
//       });
//     }

//     // ✅ Send final recognition result
//     res.json({
//       matched: true,
//       type,
//       requestedFloor,
//       detectedFloor,
//       distance: best.dist,
//     });
//   } catch (err: any) {
//     console.error("Recognition error:", err.message || err);
//     res.status(500).json({ error: err.message || "Internal server error during recognition" });
//   }
// });

// /* 🟢 GET /api/recognitions/alerts — Fetch all recent alerts */
// router.get("/alerts", async (_req: Request, res: Response) => {
//   try {
//     const alerts = await Alert.find({})
//       .sort({ createdAt: -1 })
//       .limit(200)
//       .populate("visitorId stationId visitId");
//     res.json(alerts);
//   } catch (err: any) {
//     console.error("Error fetching alerts:", err.message || err);
//     res.status(500).json({ error: "Failed to fetch alerts" });
//   }
// });

// /* 🟢 PATCH /api/recognitions/alerts/:id/resolve — Mark alert resolved */
// router.patch("/alerts/:id/resolve", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     if (!id) return res.status(400).json({ error: "Alert ID required" });

//     console.log(`🔧 Resolving alert ID: ${id}`);

//     const updated = await Alert.findByIdAndUpdate(
//       id,
//       { $set: { resolved: true, resolvedAt: new Date() } },
//       { new: true }
//     );

//     if (!updated) {
//       console.warn(`⚠️ Attempted to resolve non-existent alert: ${id}`);
//       return res.status(404).json({ error: "Alert not found" });
//     }

//     console.log(`✅ Alert resolved successfully: ${id}`);
//     return res.json({ success: true, alert: updated });
//   } catch (err: any) {
//     console.error("❌ Failed to resolve alert:", err.message || err);
//     res.status(500).json({ error: err.message || "Internal server error" });
//   }
// });

// export default router;

import { Router, Request, Response, NextFunction } from "express";
import Station from "../models/Station";
import Visit from "../models/visit";
import Alert from "../models/Alert";
import { euclidean } from "../utils/distance.js";
import { FACE_MATCH_THRESHOLD } from "../utils/validate.js";
import { pushAlert } from "../ws.js";

const router = Router();

/* 🔒 Station authentication middleware */
async function stationAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ error: "Missing station token" });

    const station = await Station.findOne({ token });
    if (!station) return res.status(401).json({ error: "Invalid station token" });

    (req as any).station = station;
    next();
  } catch (err: any) {
    console.error("Station auth error:", err.message || err);
    res.status(500).json({ error: "Internal server error during station auth" });
  }
}

/* 🚀 POST /api/recognitions — Face recognition + validation */
router.post("/", stationAuth, async (req: Request, res: Response) => {
  try {
    const station = (req as any).station;
    const descriptor: number[] = req.body?.descriptor?.data;
    const photoDataUrl: string = req.body?.photoDataUrl || "";

    if (!Array.isArray(descriptor)) {
      return res.status(400).json({ error: "Descriptor missing or invalid" });
    }

    // 🔍 Match against all visits (active or expired)
    const allVisits = await Visit.find({}).populate("visitorId");
    let best: { visit: any; dist: number } | null = null;

    for (const v of allVisits) {
      const visitorDesc = (v.visitorId as any)?.descriptor?.data;
      if (!visitorDesc) continue;
      const d = euclidean(descriptor, visitorDesc);
      if (!best || d < best.dist) best = { visit: v, dist: d };
    }

    // ❌ Unknown person (no match)
    if (!best || best.dist > FACE_MATCH_THRESHOLD) {
      const detectedFloor = station.floor;

      const unknownAlert = await Alert.create({
        visitorId: null,
        visitId: null,
        detectedFloor,
        stationId: station._id,
        type: "violation",
        reason: "Unknown person detected",
      });

      pushAlert({
        alertId: unknownAlert._id.toString(),
        visitor: { name: "Unknown", phone: "", photoDataUrl },
        requestedFloor: null as any,
        detectedFloor,
        type: "violation",
        createdAt: unknownAlert.createdAt,
      });

      console.log(`🚨 Unknown person detected on floor ${detectedFloor}`);
      return res.json({ matched: false, type: "violation", detectedFloor });
    }

    // ✅ Known visitor
    const visit = best.visit;
    const requestedFloor = visit.requestedFloor;
    const detectedFloor = station.floor;

    // 🕒 Check expiry and floor validity
    const now = new Date();
    const entryTime = new Date(visit.entryTime);
    const expiryTime = new Date(entryTime.getTime() + visit.allowedDuration * 60000);

    let type = "ok";
    let reason = "";

    if (now > expiryTime) {
      type = "time_violation";
      reason = "Allowed duration exceeded";
    } else if (detectedFloor !== requestedFloor) {
      type = "floor_violation";
      reason = "Visitor on incorrect floor";
    }

    // 🚨 Create alert only for violations
    if (type !== "ok") {
      const alert = await Alert.create({
        visitorId: (visit.visitorId as any)._id,
        visitId: visit._id,
        detectedFloor,
        stationId: station._id,
        type,
        reason,
      });

      pushAlert({
        alertId: alert._id.toString(),
        visitor: {
          name: (visit.visitorId as any).name,
          phone: (visit.visitorId as any).phone,
          photoDataUrl: (visit.visitorId as any).photoDataUrl,
        },
        requestedFloor,
        detectedFloor,
        type,
        createdAt: alert.createdAt,
        reason,
      });

      if (type === "time_violation") {
        console.log(
          `⏰ Time Violation: ${(visit.visitorId as any).name} exceeded allowed stay time (expired at ${expiryTime.toLocaleTimeString()})`
        );
      } else {
        console.log(
          `🚨 Floor Violation: ${(visit.visitorId as any).name} detected on wrong floor (expected ${requestedFloor}, found ${detectedFloor})`
        );
      }
    } else {
      // ✅ Correct visitor, correct floor, within allowed time
      console.log(
        `✅ ${(visit.visitorId as any).name} validated correctly on floor ${detectedFloor} in authorized time.`
      );

      // Send transient success alert (not saved to DB)
      pushAlert({
        alertId: "none",
        visitor: {
          name: (visit.visitorId as any).name,
          phone: (visit.visitorId as any).phone,
          photoDataUrl: (visit.visitorId as any).photoDataUrl,
        },
        requestedFloor,
        detectedFloor,
        type: "ok",
        createdAt: new Date(),
        reason: "Validated in authorized time",
      });
    }

    // ✅ Send final recognition result
    res.json({
      matched: true,
      type,
      requestedFloor,
      detectedFloor,
      distance: best.dist,
    });
  } catch (err: any) {
    console.error("Recognition error:", err.message || err);
    res.status(500).json({ error: err.message || "Internal server error during recognition" });
  }
});

/* 🟢 GET /api/recognitions/alerts — Fetch recent alerts */
router.get("/alerts", async (_req: Request, res: Response) => {
  try {
    const alerts = await Alert.find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("visitorId stationId visitId");
    res.json(alerts);
  } catch (err: any) {
    console.error("Error fetching alerts:", err.message || err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

/* 🟢 PATCH /api/recognitions/alerts/:id/resolve — Mark alert resolved */
router.patch("/alerts/:id/resolve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Alert ID required" });

    console.log(`🔧 Resolving alert ID: ${id}`);

    const updated = await Alert.findByIdAndUpdate(
      id,
      { $set: { resolved: true, resolvedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      console.warn(`⚠️ Attempted to resolve non-existent alert: ${id}`);
      return res.status(404).json({ error: "Alert not found" });
    }

    console.log(`✅ Alert resolved successfully: ${id}`);
    return res.json({ success: true, alert: updated });
  } catch (err: any) {
    console.error("❌ Failed to resolve alert:", err.message || err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
