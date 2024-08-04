// generativeAI.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const YOUR_API_KEY = "AIzaSyDwvgkDHbMEx6wddqX4x9ZCRyFh7pOwlc0"; // Replace with your actual API key
const genAI = new GoogleGenerativeAI(YOUR_API_KEY);

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
