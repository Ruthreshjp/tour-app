import express from "express";

const router = express.Router();

// Placeholder routes for business ratings
router.get("/", (req, res) => {
  res.json({ success: true, message: "Business rating endpoint" });
});

export default router;
