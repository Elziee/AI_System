
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, Profile, RecommendationResult, DailyTotals, HealthRiskAssessment } from '../types';

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


export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: "你是一個專業的營養分析師。請分析這張食物圖片的營養成分，並提供詳細的營養分析報告。你的回應必須是 JSON 格式並且嚴格遵守提供的 schema。",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze image with Gemini API.");
  }
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        mealPlan: {
            type: Type.OBJECT,
            properties: {
                breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, recipe: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "ingredients", "instructions"] } }, required: ["name", "calories", "recipe"] },
                lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, recipe: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "ingredients", "instructions"] } }, required: ["name", "calories", "recipe"] },
                dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, recipe: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "ingredients", "instructions"] } }, required: ["name", "calories", "recipe"] },
                snacks: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER }, recipe: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }, instructions: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["name", "ingredients", "instructions"] } }, required: ["name", "calories", "recipe"] },
            },
            required: ["breakfast", "lunch", "dinner", "snacks"]
        },
        exercisePlan: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                weeklySchedule: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING },
                            focus: { type: Type.STRING },
                            exercises: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        sets: { type: Type.STRING },
                                        reps: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                    },
                                    required: ["name", "sets", "reps", "description"]
                                }
                            }
                        },
                        required: ["day", "focus", "exercises"]
                    }
                }
            },
            required: ["summary", "weeklySchedule"]
        }
    },
    required: ["mealPlan", "exercisePlan"]
};


export const generateRecommendations = async (profile: Profile): Promise<RecommendationResult> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const goalMap = {
        weightLoss: '減重減脂',
        muscleGain: '增肌塑形',
        maintenance: '維持健康'
    };

    const prompt = `
        你是一位經驗豐富的註冊營養師和認證的私人教練，擅長為客戶打造高度個人化且可持續的健康計畫。
        請根據以下用戶資料，為他/她量身定制一份詳細、實用的一日飲食菜單和一週運動計畫。
        所有內容請使用繁體中文。

        用戶資料:
        - 年齡: ${profile.age}
        - 性別: ${profile.gender === 'male' ? '男性' : '女性'}
        - 身高: ${profile.height} cm
        - 體重: ${profile.weight} kg
        - 每日總能量消耗 (TDEE): ${profile.tdee.toFixed(0)} 大卡
        - 健康目標: ${goalMap[profile.healthGoal]}
        - 飲食偏好: ${profile.dietaryPreferences || '無特別註明'}
        - 日常活動/興趣: ${profile.commonActivities || '無特別註明'}

        任務要求:
        1.  **一日飲食菜單 (Meal Plan):**
            -   設計一份包含早餐、午餐、晚餐和一次點心的一日菜單。
            -   菜單總熱量應約等於用戶的 TDEE，並根據其健康目標進行微調（減脂可略低，增肌可略高）。
            -   根據健康目標調整宏量營養素比例（例如，增肌需要更高蛋白質，減脂需要控制碳水和脂肪）。
            -   為每一餐提供一份簡單、易於製作的食譜，包含食材和步驟。
            -   **高度個人化:** 請務必考慮用戶的飲食偏好。例如，如果用戶喜歡甜食，請在點心中加入健康的甜味選擇（如水果、優格），而不是完全禁止。如果用戶不吃辣，請避免辛辣的食譜。

        2.  **一週運動計畫 (Exercise Plan):**
            -   設計一份包含3-5天訓練的一週運動計畫，計畫必須實用且易於執行。
            -   計畫應與用戶的健康目標直接相關：
                -   **減重減脂:** 結合有氧運動和基礎力量訓練。
                -   **增肌塑形:** 側重於力量訓練，並輔以適量有氧。
                -   **維持健康:** 包含多樣化的運動。
            -   為每個訓練日指定訓練重點。
            -   為每個訓練動作提供名稱、建議組數和次數，以及簡短的動作描述。
            -   **高度個人化:** 請結合用戶的日常活動和興趣。例如，如果用戶活動水平較低但喜歡散步，請建議將散步升級為快走或增加時長，使其成為有效的運動。將建議融入用戶現有習慣中，使其更容易執行。

        請嚴格按照提供的 JSON schema 格式返回你的回答。
    `;
    
    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: recommendationSchema,
          },
        });
    
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RecommendationResult;
      } catch (error) {
        console.error("Error calling Gemini API for recommendations:", error);
        throw new Error("Failed to generate recommendations with Gemini API.");
      }
};

const healthRiskSchema = {
    type: Type.OBJECT,
    properties: {
        overallRiskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        summary: { type: Type.STRING, description: 'A brief summary of the user\'s long-term health risks based on their diet.' },
        potentialRisks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    riskName: { type: Type.STRING, description: 'Name of the potential health risk in Traditional Chinese.' },
                    explanation: { type: Type.STRING, description: 'Explanation of why this is a risk based on the provided data.' },
                    recommendation: { type: Type.STRING, description: 'Actionable recommendations to mitigate this risk.' }
                },
                required: ['riskName', 'explanation', 'recommendation']
            }
        }
    },
    required: ['overallRiskLevel', 'summary', 'potentialRisks']
};

export const generateHealthRiskAssessment = async (profile: Profile, averageIntake: DailyTotals): Promise<HealthRiskAssessment> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const goalMap = {
        weightLoss: '減重減脂',
        muscleGain: '增肌塑形',
        maintenance: '維持健康'
    };

    const prompt = `
        你是一位結合了數據分析能力的註冊營養師和預防醫學專家。你的任務是根據用戶的個人健康資料和長期的平均每日營養攝取數據，評估其潛在的健康風險，並提供專業、可行的預防建議。所有內容請使用繁體中文。

        用戶資料:
        - 年齡: ${profile.age}
        - 性別: ${profile.gender === 'male' ? '男性' : '女性'}
        - 身高: ${profile.height} cm
        - 體重: ${profile.weight} kg
        - 每日總能量消耗 (TDEE): ${profile.tdee.toFixed(0)} 大卡
        - 健康目標: ${goalMap[profile.healthGoal]}

        長期平均每日營養攝取:
        - 總熱量: ${averageIntake.calories.toFixed(0)} 大卡
        - 蛋白質: ${averageIntake.protein.toFixed(1)} 克
        - 碳水化合物: ${averageIntake.carbohydrates.toFixed(1)} 克
        - 脂肪: ${averageIntake.fat.toFixed(1)} 克
        - 鈉: ${averageIntake.sodium.toFixed(0)} 毫克
        - 膳食纖維: ${averageIntake.fiber.toFixed(1)} 克

        任務要求:
        1.  **綜合評估:**
            -   首先，提供一個整體的健康風險等級 (low, medium, high)。
            -   接著，撰寫一段簡潔的總結，概括用戶目前的飲食模式對長期健康的影響。

        2.  **識別潛在風險:**
            -   根據提供的數據，識別出 2-3 個最主要的潛在健康風險。
            -   常見風險包括但不限於：第二型糖尿病（與高碳水/總熱量有關）、心血管疾病（與高脂肪/高鈉有關）、營養不均衡、膳食纖維攝取不足等。
            -   對於每一個識別出的風險:
                a.  **風險名稱 (riskName):** 清晰地命名風險，例如 "心血管健康風險"。
                b.  **解釋 (explanation):** 具體說明為什麼基於用戶的數據，這個風險值得關注。例如："您每日的平均脂肪和鈉攝取量偏高，長期下來可能增加高血壓和膽固醇問題的風險。"
                c.  **建議 (recommendation):** 提供 1-2 條具體、可行的改善建議。例如："建議您選擇瘦肉蛋白，並在烹飪時減少鹽的使用量。"

        請嚴格按照提供的 JSON schema 格式返回你的回答。
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: healthRiskSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as HealthRiskAssessment;
    } catch (error) {
        console.error("Error calling Gemini API for health risk assessment:", error);
        throw new Error("Failed to generate health risk assessment with Gemini API.");
    }
};
