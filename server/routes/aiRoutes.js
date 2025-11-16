import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { protect } from "../middleware/authMiddleware.js";

dotenv.config();
const router = express.Router();

async function callGeminiAPI(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("🔍 Gemini Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return `⚠️ AI Error: ${data.error.message}`;
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No response from AI."
    );
  } catch (err) {
    console.error("❌ Gemini API Error:", err);
    return "⚠️ AI request failed.";
  }
}

router.post("/analyze", protect, async (req, res) => {
  try {
    const { title, desc } = req.body;

    const prompt = `
Analyze this task and give a short helpful insight.

Task:
Title: ${title}
Description: ${desc}
`;

    const result = await callGeminiAPI(prompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.post("/analyze-all", protect, async (req, res) => {
  try {
    const { tasks } = req.body;

    const prompt = `
You are an AI assistant. Summarize these tasks:

${tasks.map((t) => `- ${t.title}: ${t.desc}`).join("\n")}
`;

    const result = await callGeminiAPI(prompt);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
