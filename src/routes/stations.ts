import { Router } from "express";
import Station from "../models/Station.js";
import crypto from "crypto";

const router = Router();

// register/update a phone as floor station
router.post("/", async (req, res) => {
  const { name, floor } = req.body;
  if (!name || typeof floor !== "number") return res.status(400).json({ error: "name & floor required" });
  const token = crypto.randomBytes(16).toString("hex");
  const station = await Station.create({ name, floor, token });
  res.json({ station });
});

// change floor (optional)
router.patch("/:id/floor", async (req, res) => {
  const { floor } = req.body;
  const station = await Station.findByIdAndUpdate(req.params.id, { floor }, { new: true });
  res.json({ station });
});

export default router;
