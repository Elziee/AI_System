import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, children, ...props }) => {
  return (
    <div>
      <label htmlFor={props.name} className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
      <select
        id={props.name}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition appearance-none bg-no-repeat bg-right"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.5em 1.5em',
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default Select;