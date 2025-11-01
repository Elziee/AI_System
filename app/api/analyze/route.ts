import { Type } from "@google/genai";
import { ai } from '../../../server/geminiClient';
import type { AnalysisResult } from '../../../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: 'The name of the food meal in Traditional Chinese.' },
    mainComponents: {
      type: Type.ARRAY,
      description: 'List of main food components in the image.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the component in Traditional Chinese.' },
          weight: { type: Type.NUMBER, description: 'Estimated weight in grams.' },
          calories: { type: Type.NUMBER, description: 'Estimated calories for this component.' },
          nutrients: {
            type: Type.OBJECT,
            properties: {
              protein: { type: Type.NUMBER, description: 'Protein in grams.' },
              carbohydrates: { type: Type.NUMBER, description: 'Carbohydrates in grams.' },
              fat: { type: Type.NUMBER, description: 'Fat in grams.' },
              fiber: { type: Type.NUMBER, description: 'Dietary fiber in grams.' },
              sodium: { type: Type.NUMBER, description: 'Sodium in milligrams.' },
              vitaminC: { type: Type.NUMBER, description: 'Vitamin C in milligrams.' },
              calcium: { type: Type.NUMBER, description: 'Calcium in milligrams.' },
            },
            required: ['protein', 'carbohydrates', 'fat', 'fiber', 'sodium', 'vitaminC', 'calcium']
          },
          analysis: { type: Type.STRING, description: 'A brief nutritional analysis of this component in Traditional Chinese.' }
        },
        required: ['name', 'weight', 'calories', 'nutrients', 'analysis']
      }
    },
    totalCalories: { type: Type.NUMBER, description: 'Total estimated calories for the entire meal.' },
    nutritionTags: {
      type: Type.ARRAY,
      description: 'Keywords in Traditional Chinese describing the nutritional value, e.g., "高蛋白", "低碳水".',
      items: { type: Type.STRING }
    },
    dietaryAdvice: {
      type: Type.ARRAY,
      description: 'Recommendations or advice in Traditional Chinese related to this meal.',
      items: { type: Type.STRING }
    }
  },
  required: ['foodName', 'mainComponents', 'totalCalories', 'nutritionTags', 'dietaryAdvice']
};


export async function POST(req: Request): Promise<Response> {
  try {
    const { base64Image } = await req.json();
    if (!base64Image) {
      return new Response(JSON.stringify({ message: 'Missing base64Image' }), { status: 400 });
    }

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: "你是一個專業的營養分析師。請分析這張食物圖片的營養成分，並提供詳細的營養分析報告。你的回應必須是 JSON 格式並且嚴格遵守提供的 schema。",
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as AnalysisResult;

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error in analyze API route:", error);
    return new Response(JSON.stringify({ message: "Failed to analyze image with Gemini API." }), { status: 500 });
  }
}
