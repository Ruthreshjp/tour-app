import express from "express";

const router = express.Router();

// Placeholder routes for business views
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business view endpoint" });
});

export default router;
