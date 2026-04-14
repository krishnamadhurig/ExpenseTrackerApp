const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// AI-based category detection
async function getCategory(description) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // current available text model
      contents: `You are an expense categorization system.
Categorize this expense: "${description}".
Return ONLY one word from: food, salary, vacation, shopping, fuel, other.
Do not explain, just the word.`
    });

    const text = response.text?.trim().toLowerCase().replace(/[^a-z]/g, "");
    console.log("AI RAW:", response.text);
    console.log("AI CLEAN:", text);

    const valid = ["food", "salary", "vacation", "shopping", "fuel", "other"];
    return valid.includes(text) ? text : "other";
  } catch (err) {
    console.error("AI ERROR:", err);
    return "other";
  }
}


module.exports = { getCategory };