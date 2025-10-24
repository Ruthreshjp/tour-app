import express from "express";

const router = express.Router();

// Placeholder routes for business types
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business types endpoint" });
});

export default router;
