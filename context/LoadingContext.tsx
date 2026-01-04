import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    const handleStart = () => startLoading();
    const handleStop = () => stopLoading();

    window.addEventListener('app-loading-start', handleStart);
    window.addEventListener('app-loading-stop', handleStop);

    return () => {
      window.removeEventListener('app-loading-start', handleStart);
      window.removeEventListener('app-loading-stop', handleStop);
    };
  }, [startLoading, stopLoading]);

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const loadingEmitter = {
    start: () => window.dispatchEvent(new CustomEvent('app-loading-start')),
    stop: () => window.dispatchEvent(new CustomEvent('app-loading-stop'))
};
