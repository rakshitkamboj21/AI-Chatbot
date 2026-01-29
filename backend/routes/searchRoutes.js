import express from "express";
import { searchGoogle } from "../utils/searchUtil.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const results = await searchGoogle(query);
  res.json(results);
});

export default router;
