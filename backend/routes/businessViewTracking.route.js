import express from "express";

const router = express.Router();

// Placeholder routes for business view tracking
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business view tracking endpoint" });
});

export default router;
