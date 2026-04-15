// import express from "express";
// import Visitor from "../models/Visitor";   // make sure you have this model
// import Recognition from "../models/Recognition"; // alert/recognition model
// import Camera from "../models/Camera";     // optional model
// const router = express.Router();

// // GET /api/dashboard/stats
// router.get("/stats", async (req, res) => {
//   try {
//     const [visitors, alerts, cameras] = await Promise.all([
//       Visitor.find(),
//       Recognition.find(),
//       Camera.find().catch(() => []),
//     ]);

//     const activeVisitors = visitors.filter((v) => v.status === "active").length;
//     const totalVisitors = visitors.length;
//     const pendingAlerts = alerts.filter((a) => a.type === "violation").length;
//     const activeCameras = cameras.length || 0;

//     res.json({ activeVisitors, totalVisitors, pendingAlerts, activeCameras });
//   } catch (err) {
//     console.error("Error fetching dashboard stats:", err);
//     res.status(500).json({ message: "Failed to fetch dashboard stats" });
//   }
// });

// export default router;


import { Router } from "express";
import Visit from "../models/visit";
import Alert from "../models/Alert";
import Camera from "../models/Camera";

const router = Router();

/**
 * 🧠 Dashboard Stats API
 * GET /api/dashboard/stats
 */
router.get("/stats", async (_req, res) => {
  try {
    const now = new Date();

    // ✅ Count visitors whose allowed time hasn't expired yet
    const activeVisitors = await Visit.countDocuments({
      status: "active",
      $expr: {
        $gt: [
          { $add: ["$entryTime", { $multiply: ["$allowedDuration", 60000] }] },
          now,
        ],
      },
    });

    // ✅ Total number of all visitors ever registered
    const totalVisitors = await Visit.countDocuments();

    // ✅ Pending alerts (not resolved yet)
    const pendingAlerts = await Alert.countDocuments({ resolved: false });

    // ✅ Active cameras (if you track camera activity)
    const activeCameras = await Camera.countDocuments({ active: true });

    res.json({
      activeVisitors,
      totalVisitors,
      pendingAlerts,
      activeCameras,
    });
  } catch (err) {
    console.error("❌ Dashboard stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

export default router;
