import React from 'react';
import Button from '../ui/Button';
import { Page } from '../../types';

interface HomePageProps {
  setCurrentPage: (page: Page) => void;
}


const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-5 animate-fadeIn">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-6 leading-tight">
            基於人工智能的營養及健康管理系統
          </h1>
          <p className="text-lg text-text-secondary mb-8">
            歡迎使用我們的AI營養健康管理系統。這個系統將幫助您追蹤和改善您的飲食習慣，提供個性化的營養建議，並協助您達到健康目標。
          </p>
          <div className="flex justify-center md:justify-start">
             <Button onClick={() => setCurrentPage('food-analysis')} className="px-10 py-4 text-lg">
                開始分析
             </Button>
          </div>
        </div>
        <div className="p-4 bg-surface rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
            alt="健康飲食與生活方式"
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;