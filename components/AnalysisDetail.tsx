
import React from 'react';
import type { AnalysisResult } from '../types';

interface AnalysisDetailProps {
  analysis: AnalysisResult;
}

const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ analysis }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-2xl font-bold text-text-primary">{analysis.foodName}</h3>
        <p className="font-semibold text-primary text-lg">{analysis.totalCalories.toFixed(0)} 大卡</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {analysis.nutritionTags.map(tag => <span key={tag} className="bg-primary-light text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>)}
      </div>
      <div>
        <h4 className="font-semibold text-text-primary mb-2">主要成份:</h4>
        <ul className="space-y-3">
          {analysis.mainComponents.map((comp, i) => (
            <li key={i} className="p-4 bg-background rounded-lg border border-gray-200/80">
              <p className="font-bold text-text-primary">{comp.name} (~{comp.weight}g) - {comp.calories.toFixed(0)} 大卡</p>
              <p className="text-sm text-text-secondary mt-1">{comp.analysis}</p>
              <div className="text-xs text-primary mt-2 grid grid-cols-3 gap-2 text-center">
                <span className="bg-primary-light p-1 rounded">蛋白: {comp.nutrients.protein}g</span>
                <span className="bg-primary-light p-1 rounded">碳水: {comp.nutrients.carbohydrates}g</span>
                <span className="bg-primary-light p-1 rounded">脂肪: {comp.nutrients.fat}g</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-text-primary mb-2">飲食建議:</h4>
        <ul className="list-disc list-inside space-y-1 text-text-secondary">
          {analysis.dietaryAdvice.map((adv, i) => <li key={i}>{adv}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisDetail;
