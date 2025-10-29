import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div>
      <label htmlFor={props.name} className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
      <input
        id={props.name}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
        {...props}
      />
    </div>
  );
};

export default Input;