import { Node } from "@xyflow/react"

export const generateFlowCode = (nodes: Node[]): string => {
    const promptNode = nodes.find(n => n.type === 'prompt')

    const systemPrompt = (promptNode?.data?.instruction as string) || "You are a helpful AI assistant."
    const modelName = "gemini-2.0-flash"

    return `
/**
 * Auto-generated Agent Logic from DevStudio X AgentFlow
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const executeAgent = async (userInput: string) => {
    const model = genAI.getGenerativeModel({ 
        model: "${modelName}",
        systemInstruction: "${systemPrompt.replace(/"/g, '\\"')}"
    });

    try {
        const result = await model.generateContent(userInput);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Agent Execution Failed:", error);
        throw error;
    }
};
`.trim()
}
