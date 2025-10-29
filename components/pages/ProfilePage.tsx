
import React, { useState, useEffect } from 'react';
import type { UserData, Profile, HealthGoal } from '../../types';
import { ACTIVITY_LEVELS, HEALTH_GOALS } from '../../constants';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface ProfilePageProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, setUserData }) => {
  const [formState, setFormState] = useState({
    age: userData.profile?.age || 25,
    gender: userData.profile?.gender || 'male',
    height: userData.profile?.height || 170,
    weight: userData.profile?.weight || 65,
    activityLevel: userData.profile?.activityLevel || 1.2,
    healthGoal: userData.profile?.healthGoal || 'maintenance',
    dietaryPreferences: userData.profile?.dietaryPreferences || '',
    commonActivities: userData.profile?.commonActivities || '',
  });
  
  const [results, setResults] = useState<Profile | null>(userData.profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Check if the field should be a number
    if (['age', 'height', 'weight', 'activityLevel'].includes(name)) {
        setFormState(prev => ({ ...prev, [name]: Number(value) }));
    } else {
        setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateBMR = (profile: Omit<Profile, 'bmr' | 'tdee' | 'evaluationMessage'>) => {
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    }
    return 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
  };

  const calculateTDEE = (bmr: number, activityLevel: number) => {
    return bmr * activityLevel;
  };

  const getEvaluationMessage = (activityLevel: number): string => {
    switch (activityLevel) {
      case 1.2:
        return "您的活動水平屬於久坐類型。建議您嘗試每週增加2-3次輕度運動，如快走或騎自行車，這將有助於提高新陳代謝並改善整體健康。";
      case 1.375:
        return "您有輕度的身體活動，這是一個很好的開始！為了進一步提升健康水平，可以考慮將運動頻率增加到每週3-4次，並嘗試一些中等強度的活動。";
      case 1.55:
        return "您的活動量已達到中等水平，非常棒！請繼續保持這個良好的習慣。規律的運動對維持體重和心血管健康至關重要。";
      case 1.725:
        return "您的活動量非常活躍，這對您的健康非常有益。請確保您的飲食能提供足夠的能量來支持您的運動量，並注意適當的休息與恢復。";
      case 1.9:
        return "您達到了極高的活動水平，可能是一位運動員或從事高強度體力工作。在這種情況下，專業的營養支持和恢復策略至關重要，以確保身體機能處於最佳狀態。";
      default:
        return "請根據您的活動水平調整您的生活方式。";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bmr = calculateBMR(formState);
    const tdee = calculateTDEE(bmr, formState.activityLevel);
    const evaluationMessage = getEvaluationMessage(formState.activityLevel);
    
    const newProfile: Profile = { ...formState, healthGoal: formState.healthGoal as HealthGoal, bmr, tdee, evaluationMessage };
    setUserData(prev => ({ ...prev, profile: newProfile }));
    setResults(newProfile);
  };

  return (
    <div className="container mx-auto p-5 animate-fadeIn">
      <h1 className="text-3xl font-bold text-text-primary mb-6">個人資料</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-primary mb-4">輸入您的資訊</h2>
            <div className="space-y-4">
              <Input label="年齡" type="number" name="age" value={formState.age} onChange={handleChange} required />
              <Select label="性別" name="gender" value={formState.gender} onChange={handleChange}>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </Select>
              <Input label="身高 (cm)" type="number" name="height" value={formState.height} onChange={handleChange} required />
              <Input label="體重 (kg)" type="number" name="weight" value={formState.weight} onChange={handleChange} required />
              <Select label="活動量" name="activityLevel" value={formState.activityLevel} onChange={handleChange}>
                {ACTIVITY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </Select>
               <Select label="健康目標" name="healthGoal" value={formState.healthGoal} onChange={handleChange}>
                {HEALTH_GOALS.map(goal => (
                  <option key={goal.value} value={goal.value}>{goal.label}</option>
                ))}
              </Select>
              <Input 
                label="飲食偏好 (選填)" 
                type="text" 
                name="dietaryPreferences" 
                value={formState.dietaryPreferences} 
                onChange={handleChange} 
                placeholder="例如：喜歡吃甜食、不吃辣" 
              />
              <Input 
                label="日常活動/興趣 (選填)" 
                type="text" 
                name="commonActivities" 
                value={formState.commonActivities} 
                onChange={handleChange} 
                placeholder="例如：辦公室工作、喜歡散步" 
              />
              <div className="pt-2">
                <Button type="submit">計算並儲存</Button>
              </div>
            </div>
          </form>
        </Card>
        {results && (
          <Card className="bg-gradient-to-br from-primary to-green-600 text-white animate-fadeIn">
             <div className="divide-y divide-white/20">
                <div className="pb-4">
                    <h2 className="text-xl font-semibold text-white/90 mb-6">您的每日建議攝取量</h2>
                    <div className="space-y-6 text-lg">
                    <div className="flex justify-between items-baseline">
                        <span className="text-white/80">基礎代謝率 (BMR)</span>
                        <span className="font-bold text-3xl">{results.bmr.toFixed(0)} <span className="text-base font-normal">大卡/天</span></span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-white/80">每日總能量消耗 (TDEE)</span>
                        <span className="font-bold text-3xl">{results.tdee.toFixed(0)} <span className="text-base font-normal">大卡/天</span></span>
                    </div>
                    </div>
                </div>
                <div className="pt-6">
                    <h2 className="text-xl font-semibold text-white/90 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        健康狀況評估
                    </h2>
                    <p className="text-white/80 text-sm leading-relaxed">{results.evaluationMessage}</p>
                </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;