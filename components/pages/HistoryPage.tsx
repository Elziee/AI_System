
import React, { useState } from 'react';
import type { UserData, FoodEntry, MealType } from '../../types';
import { MEAL_TYPES } from '../../constants';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import AnalysisDetail from '../AnalysisDetail';

interface HistoryPageProps {
  userData: UserData;
}

const MealTypeMap: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '點心',
}

const HistoryPage: React.FC<HistoryPageProps> = ({ userData }) => {
  const [selectedEntry, setSelectedEntry] = useState<FoodEntry | null>(null);

  const sortedFoodLog = [...userData.foodLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto p-5 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">飲食歷史記錄</h1>
      </div>
      
      {sortedFoodLog.length > 0 ? (
        <div className="space-y-4">
          {sortedFoodLog.map(entry => (
            <Card key={entry.id} className="cursor-pointer hover:border-primary" onClick={() => setSelectedEntry(entry)}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg text-primary">{entry.analysis.foodName}</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(entry.date).toLocaleString('zh-TW')} - {MealTypeMap[entry.mealType]}
                  </p>
                </div>
                <div className="text-right">
                   <p className="font-semibold text-xl text-text-primary">{entry.analysis.totalCalories.toFixed(0)} <span className="text-sm font-normal">大卡</span></p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-text-primary">尚無歷史記錄</h3>
          <p className="mt-1 text-sm text-text-secondary">開始分析食物來建立您的飲食日誌吧！</p>
        </div>
      )}

      {selectedEntry && (
        <Modal isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="分析詳情">
          <AnalysisDetail analysis={selectedEntry.analysis} />
        </Modal>
      )}
    </div>
  );
};

export default HistoryPage;
