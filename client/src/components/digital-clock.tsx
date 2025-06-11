import { useState, useEffect } from "react";
import { Sun, Moon, Settings } from "lucide-react";

export function DigitalClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const hour = currentTime.getHours();
  const isDayTime = hour >= 6 && hour < 18;

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <div className="text-lg font-bold text-white">{timeString}</div>
        <div className="flex items-center justify-end space-x-1 text-xs text-gray-400">
          {isDayTime ? (
            <Sun className="w-3 h-3" />
          ) : (
            <Moon className="w-3 h-3" />
          )}
          <span>{isDayTime ? 'Day' : 'Night'}</span>
        </div>
      </div>
      <button 
        onClick={() => setShowSettings(!showSettings)}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ios-button transition-all duration-200"
      >
        <Settings className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
