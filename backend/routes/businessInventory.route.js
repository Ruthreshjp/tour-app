import express from "express";

const router = express.Router();

// Placeholder routes for business inventory
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business inventory endpoint" });
});

export default router;
