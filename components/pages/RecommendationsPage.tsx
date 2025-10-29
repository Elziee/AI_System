
import React, { useState, useCallback } from 'react';
import { generateRecommendations } from '../../services/geminiService';
import type { UserData, RecommendationResult, Page, MealPlan, ExercisePlan } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface RecommendationsPageProps {
  userData: UserData;
  setCurrentPage: (page: Page) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
    <p className="text-primary font-medium text-lg">AI 正在為您量身打造專屬計畫，請稍候...</p>
    <p className="text-text-secondary text-sm">這可能需要30秒到1分鐘的時間</p>
  </div>
);

const MealPlanDisplay: React.FC<{ plan: MealPlan }> = ({ plan }) => (
    <div className="space-y-6">
        {Object.entries(plan).map(([mealType, meal]) => (
            <Card key={mealType}>
                <h3 className="text-xl font-semibold text-primary capitalize">{mealType} - {meal.name}</h3>
                <p className="text-sm text-text-secondary mb-3">{meal.calories.toFixed(0)} 大卡</p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-1">食材:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                           {meal.recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">步驟:</h4>
                        <ol className="list-decimal list-inside text-sm space-y-1">
                           {meal.recipe.instructions.map((item, i) => <li key={i}>{item}</li>)}
                        </ol>
                    </div>
                </div>
            </Card>
        ))}
    </div>
);

const ExercisePlanDisplay: React.FC<{ plan: ExercisePlan }> = ({ plan }) => (
    <div className="space-y-4">
        <p className="text-text-secondary italic text-center mb-6">{plan.summary}</p>
        {plan.weeklySchedule.map(day => (
            <Card key={day.day}>
                <h3 className="text-xl font-semibold text-primary">{day.day}: {day.focus}</h3>
                <div className="divide-y divide-gray-200/50 mt-3">
                    {day.exercises.map((ex, i) => (
                        <div key={i} className="py-3">
                            <h4 className="font-semibold">{ex.name}</h4>
                            <p className="text-sm text-text-secondary">{ex.sets} x {ex.reps}</p>
                            <p className="text-xs mt-1 text-gray-500">{ex.description}</p>
                        </div>
                    ))}
                </div>
            </Card>
        ))}
    </div>
);


const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ userData, setCurrentPage }) => {
    const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'meal' | 'exercise'>('meal');

    const handleGenerate = useCallback(async () => {
        if (!userData.profile) {
            setError('請先建立您的個人資料。');
            return;
        }
        setIsLoading(true);
        setError(null);
        setRecommendations(null);
        try {
            const result = await generateRecommendations(userData.profile);
            setRecommendations(result);
        } catch (err) {
            setError('生成建議失敗，請稍後再試。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [userData.profile]);

    if (!userData.profile) {
        return (
            <div className="container mx-auto p-5 text-center animate-fadeIn">
                <Card className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-primary mb-4">個人化建議</h2>
                    <p className="text-text-secondary mb-6">請先建立您的個人資料，我們才能為您量身打造飲食與運動計畫。</p>
                    <Button onClick={() => setCurrentPage('profile')}>前往個人資料</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-5 animate-fadeIn">
            <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">您的個人化健康計畫</h1>
            <p className="text-text-secondary mb-8 text-center">根據您的資料和目標，AI 為您生成了以下建議。</p>
            
            {!recommendations && !isLoading && (
                 <div className="text-center">
                    <Button onClick={handleGenerate} className="max-w-xs mx-auto">
                        生成我的計畫
                    </Button>
                 </div>
            )}
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            
            {recommendations && (
                <div>
                    <div className="mb-6 flex justify-center border-b border-gray-200">
                        <button onClick={() => setActiveTab('meal')} className={`px-6 py-3 font-semibold ${activeTab === 'meal' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>飲食計畫</button>
                        <button onClick={() => setActiveTab('exercise')} className={`px-6 py-3 font-semibold ${activeTab === 'exercise' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>運動計畫</button>
                    </div>
                    {activeTab === 'meal' ? <MealPlanDisplay plan={recommendations.mealPlan} /> : <ExercisePlanDisplay plan={recommendations.exercisePlan} />}
                    <div className="text-center mt-8">
                        <Button onClick={handleGenerate} className="max-w-xs mx-auto">
                            重新生成計畫
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationsPage;
