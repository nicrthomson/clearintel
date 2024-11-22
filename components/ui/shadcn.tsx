import React from "react";

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${props.className || ''}`}
    />
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({ error, ...props }) => {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'} ${props.className || ''}`}
    />
  );
};

export const FormError: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <p className="text-red-500 text-sm mt-1">{children}</p>;
};
