import { Type } from "@google/genai";
import { ai } from '../../../server/geminiClient';
import type { Profile, RecommendationResult } from '../../../types';

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

export async function POST(req: Request): Promise<Response> {
    try {
        const { profile }: { profile: Profile } = await req.json();
        if (!profile) {
            return new Response(JSON.stringify({ message: 'Missing profile data' }), { status: 400 });
        }

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
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: recommendationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as RecommendationResult;
        
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error calling Gemini API for recommendations:", error);
        return new Response(JSON.stringify({ message: "Failed to generate recommendations with Gemini API." }), { status: 500 });
    }
}
