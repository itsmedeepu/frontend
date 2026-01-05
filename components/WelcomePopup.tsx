import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Clock } from 'lucide-react';

interface WelcomePopupProps {
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        {/* Progress bar for auto-close */}
        <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / 20) * 100}%` }} />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 transform rotate-3">
              <Clock className="h-10 w-10 text-emerald-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              Welcome to AgriDirect!
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Our backend is spinning up to provide you with the freshest experience. 
              <span className="block font-bold mt-2 text-emerald-700">Please wait for about 20-30 seconds while the data loads.</span>
            </p>

            <div className="w-full space-y-4">
              <a 
                href="https://drive.google.com/file/d/1Ok0qaoV-Gbswm9LAzUHiH3LuukwlTC8E/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200"
              >
                <ExternalLink className="h-5 w-5" />
                Watch Project Demo Video
              </a>
              
              <button
                onClick={onClose}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Close ({timeLeft}s)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
