import { Type } from "@google/genai";
import { ai } from '../../../server/geminiClient';
import type { Profile, DailyTotals, HealthRiskAssessment } from '../../../types';

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

export async function POST(req: Request): Promise<Response> {
    try {
        const { profile, averageIntake }: { profile: Profile; averageIntake: DailyTotals } = await req.json();

        if (!profile || !averageIntake) {
            return new Response(JSON.stringify({ message: 'Missing profile or average intake data' }), { status: 400 });
        }
        
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: healthRiskSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as HealthRiskAssessment;

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error calling Gemini API for health risk assessment:", error);
        return new Response(JSON.stringify({ message: "Failed to generate health risk assessment with Gemini API." }), { status: 500 });
    }
}
