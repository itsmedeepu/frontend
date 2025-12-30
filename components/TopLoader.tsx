import React, { useEffect, useState } from 'react';
import { useLoading } from '../context/LoadingContext';

const TopLoader: React.FC = () => {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setVisible(true);
      setOpacity(1);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 40) return prev + 3;
          if (prev < 80) return prev + 1;
          if (prev < 95) return prev + 0.2;
          return prev;
        });
      }, 100);
    } else {
      setProgress(100);
      // Wait for the transition to 100% to finish, then fade out
      const fadeTimeout = setTimeout(() => {
        setOpacity(0);
      }, 400);

      const hideTimeout = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 800);

      return () => {
        clearInterval(interval);
        clearTimeout(fadeTimeout);
        clearTimeout(hideTimeout);
      };
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full h-1 z-[9999] transition-opacity duration-300"
      style={{ opacity }}
    >
      <div 
        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopLoader;
