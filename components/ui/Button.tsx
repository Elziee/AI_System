import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`w-full bg-gradient-to-r from-primary to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;