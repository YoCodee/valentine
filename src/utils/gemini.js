import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const classifyDrawing = async (base64Image) => {
  try {
    if (!API_KEY) {
      console.error("Gemini API Key is missing!");
      return "heart"; // Fallback to heart if no API key
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Remove the data URL prefix to get just the base64 string
    const base64Data = base64Image.replace(
      /^data:image\/(png|jpeg|jpg);base64,/,
      "",
    );

    const prompt = `Analyze this simple line drawing. 
    Classify it into one of these categories: 'heart', 'flower', 'chocolate', 'star'.
    
    Rules:
    - If it looks like a heart shape, return "heart".
    - If it looks like a flower, rose, or plant, return "flower".
    - If it looks like a box, square, or food, return "chocolate".
    - If it looks like a star or sparkle, return "star".
    - If you are completely unsure, make a guess based on the closest shape.
    - Return ONLY the single word (lowercase) as the response.`;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    console.log("Gemini Classification:", text);

    // Validate result to ensure it's one of our expected types
    const validTypes = ["heart", "flower", "chocolate", "star"];
    if (validTypes.includes(text)) {
      return text;
    }

    return "heart"; // Default fallback
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "heart"; // Fallback on error
  }
};
