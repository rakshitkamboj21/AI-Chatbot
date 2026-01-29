import mongoose from "mongoose";

const knowledgeSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

// Use exact collection name in MongoDB
export default mongoose.model("Knowledge", knowledgeSchema, "Knowledge");
