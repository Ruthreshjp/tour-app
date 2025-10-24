import express from "express";

const router = express.Router();

// Placeholder routes for business bookings
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business booking endpoint" });
});

export default router;
