import React from 'react';

// Fix: Extend React.HTMLAttributes<HTMLDivElement> to allow onClick and other div props.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-200/50 transition-shadow duration-300 hover:shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;