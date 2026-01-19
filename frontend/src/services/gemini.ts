import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is not set in .env variables");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

export const getGeminiResponse = async (message: string): Promise<string> => {
    if (!API_KEY) {
        return "I'm sorry, but I'm not correctly configured yet. Please check my API key settings.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Add system-like context by prepending to the user message or using chat history
        // For now, we'll keep it simple but adding context about being a coding assistant
        const prompt = `You are Riley, an intelligent and helpful AI coding assistant. 
    Your goal is to help users with coding, debugging, and software concepts. 
    Be concise, clear, and provide code examples when relevant.
    
    User: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error: any) {
        console.error("Error fetching Gemini response:", error);
        return `Error: ${error.message || String(error)}. Please check your API key and connection.`;
    }
};
