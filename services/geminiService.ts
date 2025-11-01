import type { AnalysisResult, Profile, RecommendationResult, DailyTotals, HealthRiskAssessment } from '../types';

// Since we are in a frontend-only environment, we can't have a real server.
// We will simulate the Next.js API structure by directly importing the 'route handlers'.
import { POST as analyzeHandler } from '../app/api/analyze/route';
import { POST as recommendationsHandler } from '../app/api/recommendations/route';
import { POST as healthRiskHandler } from '../app/api/health-risk/route';


/**
 * Simulates a client-side `fetch` call to a Next.js API route.
 * In this environment, it directly invokes the handler function.
 * @param handler The imported route handler function (e.g., POST).
 * @param body The request body to send.
 * @returns The JSON response from the handler.
 */
async function fakeFetch<T>(handler: (req: Request) => Promise<Response>, body: object): Promise<T> {
    const request = new Request('http://localhost/api/placeholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    
    const response = await handler(request);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'API request failed');
    }

    return response.json();
}

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
    return fakeFetch<AnalysisResult>(analyzeHandler, { base64Image });
};

export const generateRecommendations = async (profile: Profile): Promise<RecommendationResult> => {
    return fakeFetch<RecommendationResult>(recommendationsHandler, { profile });
};

export const generateHealthRiskAssessment = async (profile: Profile, averageIntake: DailyTotals): Promise<HealthRiskAssessment> => {
    return fakeFetch<HealthRiskAssessment>(healthRiskHandler, { profile, averageIntake });
};
