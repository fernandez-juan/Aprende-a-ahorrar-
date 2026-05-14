import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType, FinancialInsight } from "../types/finance";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const aiService = {
  /**
   * Analyze a ticket image and extract financial data
   */
  async analyzeTicket(base64Image: string, userId: string): Promise<Partial<Transaction>> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: "Analyze this purchase ticket. Extract: amount (number), category (one of: Food, Transport, Shopping, Health, Entertainment, Utilities, Other), description (short name of store), and a short 'smart note' about the expense. Return as JSON."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            smartNote: { type: Type.STRING }
          },
          required: ["amount", "category", "description"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return {
      userId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      smartNotes: data.smartNote,
      type: 'expense' as TransactionType,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Get personalized financial advice and chat response (supports voice context)
   */
  async getFinancialAdvice(query: string, context: { transactions: Transaction[], income: number }): Promise<string> {
    const summary = context.transactions.slice(0, 50).map(t => `${t.date}: ${t.description} - ${t.amount} (${t.category})`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are Aura, a futuristic financial AI assistant. 
      User Query: "${query}"
      User Income: $${context.income}
      Recent Transactions:
      ${summary}
      
      Provide a clear, concise, and helpful response. If they ask about specific categories like fast food or total spent, calculate it accurately from the provided summary. Use a friendly and professional tone. Keep it short for voice response.`,
    });

    return response.text || "Lo siento, no pude procesar esa consulta financiera en este momento.";
  },

  /**
   * Generate predictive insights and savings recommendations
   */
  async getInsights(context: { transactions: Transaction[], income: number, goals: any[] }): Promise<FinancialInsight[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this user's financial situation:
      Income: $${context.income}
      Transactions: ${JSON.stringify(context.transactions.slice(0, 30))}
      Goals: ${JSON.stringify(context.goals)}
      
      Generate 3 specific insights:
      1. A prediction of future expenses based on patterns.
      2. A savings recommendation to reach one of their goals faster.
      3. A potential adjustment to their spending.
      
      Return as a JSON array of objects with: type (prediction|saving|alert|investment), title, message, impact (positive|negative|neutral).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              impact: { type: Type.STRING }
            },
            required: ["type", "title", "message", "impact"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  }
};
