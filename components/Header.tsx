
import React from 'react';
import type { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavLink: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
}> = ({ page, currentPage, setCurrentPage, children }) => {
  const isActive = currentPage === page;
  
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-300 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
    >
      {children}
      {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary rounded-full"></span>}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-5">
        <nav className="flex items-center justify-between h-16">
          <div className="text-xl font-bold text-primary cursor-pointer" onClick={() => setCurrentPage('home')}>
            wellai.life
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <NavLink page="home" currentPage={currentPage} setCurrentPage={setCurrentPage}>主頁</NavLink>
            <NavLink page="profile" currentPage={currentPage} setCurrentPage={setCurrentPage}>個人資料</NavLink>
            <NavLink page="food-analysis" currentPage={currentPage} setCurrentPage={setCurrentPage}>食物分析</NavLink>
            <NavLink page="health-data" currentPage={currentPage} setCurrentPage={setCurrentPage}>健康數據</NavLink>
            <NavLink page="history" currentPage={currentPage} setCurrentPage={setCurrentPage}>歷史記錄</NavLink>
            <NavLink page="recommendations" currentPage={currentPage} setCurrentPage={setCurrentPage}>個人化建議</NavLink>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
