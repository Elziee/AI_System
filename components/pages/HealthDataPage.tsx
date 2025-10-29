
import React, { useMemo, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Label } from 'recharts';
import type { UserData, DailyTotals, HealthRiskAssessment } from '../../types';
import { generateHealthRiskAssessment } from '../../services/geminiService';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface HealthDataPageProps {
  userData: UserData;
}

const NutrientProgress: React.FC<{
  label: string;
  current: number;
  goal: number | undefined;
  unit: string;
  color: string;
}> = ({ label, current, goal, unit, color }) => {
  const percentage = goal ? Math.min((current / goal) * 100, 100) : 0;
  
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-semibold text-text-primary">
          {current.toFixed(unit === '克' ? 1 : 0)}
          {goal && <span className="text-sm font-normal text-text-secondary"> / {goal.toFixed(0)}</span>}
          <span className="text-sm font-normal"> {unit}</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const RiskBadge: React.FC<{ level: 'low' | 'medium' | 'high' }> = ({ level }) => {
    const config = {
        low: { text: '低風險', color: 'bg-green-100 text-green-800' },
        medium: { text: '中度風險', color: 'bg-yellow-100 text-yellow-800' },
        high: { text: '高風險', color: 'bg-red-100 text-red-800' },
    };
    const { text, color } = config[level] || { text: '未知', color: 'bg-gray-100 text-gray-800' };
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>{text}</span>;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-3 py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="text-primary font-medium">AI 正在評估您的長期健康風險...</p>
    </div>
);

const HealthDataPage: React.FC<HealthDataPageProps> = ({ userData }) => {
  const [assessment, setAssessment] = useState<HealthRiskAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const todayTotals = useMemo<DailyTotals>(() => {
    const today = new Date().toISOString().split('T')[0];
    return userData.foodLog
      .filter(entry => entry.date.startsWith(today))
      .reduce((totals, entry) => {
        totals.calories += entry.analysis.totalCalories;
        entry.analysis.mainComponents.forEach(comp => {
          totals.protein += comp.nutrients.protein;
          totals.carbohydrates += comp.nutrients.carbohydrates;
          totals.fat += comp.nutrients.fat;
          totals.fiber += comp.nutrients.fiber;
          totals.vitaminC += comp.nutrients.vitaminC;
          totals.calcium += comp.nutrients.calcium;
          totals.sodium += comp.nutrients.sodium;
        });
        return totals;
      }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, vitaminC: 0, calcium: 0, sodium: 0 });
  }, [userData.foodLog]);

  const { averageDailyIntake, totalLogDays } = useMemo(() => {
    if (userData.foodLog.length === 0) {
        return { averageDailyIntake: null, totalLogDays: 0 };
    }

    const totals: DailyTotals = { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, vitaminC: 0, calcium: 0, sodium: 0 };
    const dates = new Set<string>();

    userData.foodLog.forEach(entry => {
        dates.add(entry.date.split('T')[0]);
        totals.calories += entry.analysis.totalCalories;
        entry.analysis.mainComponents.forEach(comp => {
            totals.protein += comp.nutrients.protein;
            totals.carbohydrates += comp.nutrients.carbohydrates;
            totals.fat += comp.nutrients.fat;
            totals.fiber += comp.nutrients.fiber;
            totals.sodium += comp.nutrients.sodium;
            totals.vitaminC += comp.nutrients.vitaminC;
            totals.calcium += comp.nutrients.calcium;
        });
    });

    const numDays = dates.size > 0 ? dates.size : 1;

    const average: DailyTotals = {
        calories: totals.calories / numDays,
        protein: totals.protein / numDays,
        carbohydrates: totals.carbohydrates / numDays,
        fat: totals.fat / numDays,
        fiber: totals.fiber / numDays,
        sodium: totals.sodium / numDays,
        vitaminC: totals.vitaminC / numDays,
        calcium: totals.calcium / numDays,
    };

    return { averageDailyIntake: average, totalLogDays: numDays };
  }, [userData.foodLog]);

  const handleGenerateAssessment = useCallback(async () => {
    if (!userData.profile || !averageDailyIntake) {
        setAssessmentError("請先建立個人資料並記錄一些飲食數據。");
        return;
    }
    setIsAssessing(true);
    setAssessmentError(null);
    setAssessment(null);
    try {
        const result = await generateHealthRiskAssessment(userData.profile, averageDailyIntake);
        setAssessment(result);
    } catch (err) {
        setAssessmentError("評估生成失敗，請稍後再試。");
        console.error(err);
    } finally {
        setIsAssessing(false);
    }
  }, [userData.profile, averageDailyIntake]);
  
  const recommendedIntake = useMemo(() => {
    if (!userData.profile) return null;
    const tdee = userData.profile.tdee;
    return {
      calories: tdee,
      carbs: (tdee * 0.5) / 4,
      protein: (tdee * 0.2) / 4,
      fat: (tdee * 0.3) / 9,
      fiber: 25,
      vitaminC: 90,
      calcium: 1000,
    };
  }, [userData.profile]);

  const chartData = [
    { name: '碳水化合物', '每日營養攝取量 (克)': todayTotals.carbohydrates },
    { name: '蛋白質', '每日營養攝取量 (克)': todayTotals.protein },
    { name: '脂肪', '每日營養攝取量 (克)': todayTotals.fat },
    { name: '膳食纖維', '每日營養攝取量 (克)': todayTotals.fiber },
    { name: '維生素C', '每日營養攝取量 (克)': todayTotals.vitaminC / 1000 },
    { name: '鈣質', '每日營養攝取量 (克)': todayTotals.calcium / 1000 },
    { name: 'TDEE', 'TDEE (大卡)': userData.profile?.tdee || 0 },
  ];

  const COLORS = ['#FF80A0', '#6EBFDB', '#F7DC6F', '#48C9B0', '#FAD7A0', '#FDEBD0'];

  return (
    <div className="container mx-auto p-5 animate-fadeIn">
      <h1 className="text-3xl font-bold text-text-primary mb-6">健康數據</h1>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">今日攝取總覽</h2>
            <div className="space-y-5">
              <NutrientProgress 
                label="總熱量" 
                current={todayTotals.calories} 
                goal={recommendedIntake?.calories} 
                unit="大卡"
                color="bg-gradient-to-r from-green-400 to-primary"
              />
              <NutrientProgress 
                label="碳水化合物" 
                current={todayTotals.carbohydrates} 
                goal={recommendedIntake?.carbs} 
                unit="克"
                color="bg-[#FF80A0]"
              />
               <NutrientProgress 
                label="蛋白質" 
                current={todayTotals.protein} 
                goal={recommendedIntake?.protein} 
                unit="克"
                color="bg-[#6EBFDB]"
              />
               <NutrientProgress 
                label="脂肪" 
                current={todayTotals.fat} 
                goal={recommendedIntake?.fat} 
                unit="克"
                color="bg-[#F7DC6F]"
              />
              <NutrientProgress 
                label="膳食纖維" 
                current={todayTotals.fiber} 
                goal={recommendedIntake?.fiber} 
                unit="克"
                color="bg-[#48C9B0]"
              />
              <NutrientProgress 
                label="維生素C" 
                current={todayTotals.vitaminC} 
                goal={recommendedIntake?.vitaminC} 
                unit="毫克"
                color="bg-[#FAD7A0]"
              />
              <NutrientProgress 
                label="鈣質" 
                current={todayTotals.calcium} 
                goal={recommendedIntake?.calcium} 
                unit="毫克"
                color="bg-[#FDEBD0]"
              />
            </div>
            {!userData.profile && <p className="text-sm text-text-secondary mt-4 text-center">請先至「個人資料」頁面填寫資訊以獲得個人化建議。</p>}
          </Card>
          <Card>
            <h2 className="text-xl font-semibold text-primary mb-4">長期健康風險評估</h2>
            {isAssessing && <LoadingSpinner />}
            {!isAssessing && !assessment && (
              <div className="text-center">
                <p className="text-text-secondary text-sm mb-4">根據您的長期飲食記錄，AI 可以為您評估潛在的健康風險並提供建議。您目前有 {totalLogDays} 天的記錄。</p>
                <Button onClick={handleGenerateAssessment} disabled={totalLogDays < 3 || !userData.profile}>
                  {totalLogDays < 3 ? `還需要 ${3 - totalLogDays} 天的記錄` : "生成健康風險評估"}
                </Button>
                {assessmentError && <p className="text-red-500 mt-2 text-sm">{assessmentError}</p>}
              </div>
            )}
            {assessment && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">綜合風險評估</h3>
                        <RiskBadge level={assessment.overallRiskLevel} />
                        <p className="mt-3 text-text-secondary text-sm">{assessment.summary}</p>
                    </div>
                    <div className="space-y-3 pt-4">
                        {assessment.potentialRisks.map((risk, index) => (
                            <div key={index} className="p-4 bg-background rounded-lg border border-gray-200/80">
                                <h4 className="font-bold text-primary">{risk.riskName}</h4>
                                <p className="text-sm text-text-secondary mt-1">{risk.explanation}</p>
                                <div className="mt-3 pt-3 border-t border-dashed">
                                    <p className="text-sm font-semibold text-text-primary mb-1">改善建議:</p>
                                    <p className="text-sm text-text-secondary">{risk.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-4">
                        <Button onClick={handleGenerateAssessment} disabled={isAssessing}>
                            重新生成評估
                        </Button>
                    </div>
                </div>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-primary mb-2">能量攝取趨勢</h2>
            <p className="text-center text-text-secondary text-sm mb-4">每日營養素攝取量與能量消耗追蹤</p>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fill: '#6B7280'}} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{fill: '#6B7280'}}>
                     <Label value="克 (g)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#6B7280' }} />
                  </YAxis>
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{fill: '#6B7280'}}>
                     <Label value="大卡 (kcal)" angle={90} position="insideRight" style={{ textAnchor: 'middle', fill: '#6B7280' }} />
                  </YAxis>
                  <Tooltip cursor={{fill: 'rgba(216, 247, 236, 0.5)'}} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="每日營養攝取量 (克)" name="每日營養攝取量 (克)" barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'TDEE' ? 'transparent' : COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar yAxisId="right" dataKey="TDEE (大卡)" name="TDEE (大卡)" fill="#76D7C4" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthDataPage;
