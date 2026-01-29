import express from "express";
import Knowledge from "../models/Knowledge.js";

const router = express.Router();

// Add FAQ
router.post("/", async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFAQ = new Knowledge({ question, answer });
    await newFAQ.save();
    res.json(newFAQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await Knowledge.find();
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
