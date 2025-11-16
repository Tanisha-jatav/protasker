import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const getAIInsight = async (task) => {
  try {
    const prompt = `Analyze the following task and suggest 
    - its importance (Low/Medium/High)
    - estimated effort (in hours)
    - and 1 motivational insight in a short sentence.
    Task: ${task.title} - ${task.desc}`;

    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const aiText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insight generated.";
    return aiText.trim();
  } catch (err) {
    console.error("AI Error:", err.message);
    return "AI failed to analyze this task.";
  }
};
