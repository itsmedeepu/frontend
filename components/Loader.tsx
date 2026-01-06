import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  showNote?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'text-emerald-600',
  className = '',
  showNote = false
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-b-2',
    lg: 'h-16 w-16 border-b-2'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      <div className={`animate-spin rounded-full ${sizeClasses[size]} ${color}`}></div>

    </div>
  );
};

export default Loader;
