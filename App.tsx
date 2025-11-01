
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import HomePage from './components/pages/HomePage';
import ProfilePage from './components/pages/ProfilePage';
import FoodAnalysisPage from './components/pages/FoodAnalysisPage';
import HealthDataPage from './components/pages/HealthDataPage';
import HistoryPage from './components/pages/HistoryPage';
import RecommendationsPage from './components/pages/RecommendationsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Page, UserData, FoodEntry } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [userData, setUserData] = useLocalStorage<UserData>('nutritionAppData', {
    profile: null,
    foodLog: [],
  });

  const addFoodEntry = (entry: FoodEntry) => {
    setUserData(prev => ({
      ...prev,
      foodLog: [...prev.foodLog, entry],
    }));
  };

  const clearFoodLog = () => {
    setUserData(prev => ({
      ...prev,
      foodLog: [],
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'profile':
        return <ProfilePage userData={userData} setUserData={setUserData} />;
      case 'food-analysis':
        return <FoodAnalysisPage addFoodEntry={addFoodEntry} />;
      case 'health-data':
        return <HealthDataPage userData={userData} />;
      case 'history':
        return <HistoryPage userData={userData} clearFoodLog={clearFoodLog} />;
      case 'recommendations':
        return <RecommendationsPage userData={userData} setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pt-20">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
