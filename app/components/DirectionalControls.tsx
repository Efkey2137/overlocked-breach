import React, { useState } from 'react';

interface DirectionalControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  className?: string;
  currentDirection?: 'up' | 'down' | 'left' | 'right' | null;
  layout?: 'vertical' | 'horizontal';
}

const DirectionalControls: React.FC<DirectionalControlsProps> = ({  
  onMove,  
  className = "",  
  currentDirection = null, 
  layout = 'vertical'
}) => {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    setActiveButton(direction);
    onMove(direction);
    setTimeout(() => {
      setActiveButton(null);
    }, 200);
  };

  const buttonClass = "select-none flex items-center justify-center rounded-full bg-gray-700 text-white transition-all duration-200 focus:outline-none active:scale-95 touch-manipulation";
  const activeClass = "bg-blue-500";

  return (
    <div className={`${className} ${layout === 'horizontal' ? 'lg:flex lg:items-center' : 'flex flex-col items-center'} select-none`}>
      <div className={`controls-container ${layout === 'horizontal' ? 'lg:mr-8' : ''} select-none`}>
        <div className="grid grid-cols-3 gap-1 sm:gap-2 select-none">
          <div className="select-none"></div>
          <button 
            className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${activeButton === 'up' || currentDirection === 'up' ? activeClass : ''}`}
            onClick={() => handleButtonPress('up')}
            aria-label="Move up"
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div className="select-none"></div>
          <button 
            className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${activeButton === 'left' || currentDirection === 'left' ? activeClass : ''}`}
            onClick={() => handleButtonPress('left')}
            aria-label="Move left"
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center justify-center select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-800 select-none"></div>
          </div>
          <button 
            className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${activeButton === 'right' || currentDirection === 'right' ? activeClass : ''}`}
            onClick={() => handleButtonPress('right')}
            aria-label="Move right"
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="select-none"></div>
          <button 
            className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${activeButton === 'down' || currentDirection === 'down' ? activeClass : ''}`}
            onClick={() => handleButtonPress('down')}
            aria-label="Move down"
            onContextMenu={(e) => e.preventDefault()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="select-none"></div>
        </div>
      </div>
    </div>
  );
};

export default DirectionalControls;
