import { useEffect, useState } from 'react';
import medicalIcon from '@/assets/medical-icon.png';

const Spinner = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center z-50">
      <div className="text-center text-white">
        {/* Medical Icon with Animation */}
        <div className="mb-8 relative">
          <img 
            src={medicalIcon} 
            alt="Medical Assistant" 
            className="w-24 h-24 mx-auto animate-pulse filter brightness-0 invert"
          />
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
        </div>
        
        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">MediChat AI</h1>
        <p className="text-xl mb-8 opacity-90">Your Intelligent Medical Assistant</p>
        
        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="bg-white/20 rounded-full h-3 mb-4">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm opacity-75">Initializing Medical AI... {progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Spinner;