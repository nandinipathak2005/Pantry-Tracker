// generativeAI.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import API_KEY from "./apikeys.js";

const genAI = new GoogleGenerativeAI(API_KEY);

export const fetchRecipeSuggestions = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    return '';
  }
};
