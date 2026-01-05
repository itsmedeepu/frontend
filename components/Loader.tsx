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
      {showNote && (
        <div className="text-center animate-fade-in max-w-md px-4">
          <p className="text-slate-600 text-sm md:text-base font-medium mb-2">
            It takes some time to spin backend server. Please wait patiently.
          </p>
          <a 
            href="https://drive.google.com/file/d/1Ok0qaoV-Gbswm9LAzUHiH3LuukwlTC8E/view?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold underline underline-offset-4 transition-colors inline-flex items-center gap-2"
          >
            <span>Click here for the video explanation</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default Loader;
