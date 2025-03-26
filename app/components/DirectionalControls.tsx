'use client';
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
    onMove(direction); // Wywołanie funkcji ruchu przekazanej jako props
    setTimeout(() => {
      setActiveButton(null); // Reset aktywnego przycisku po krótkim czasie
    }, 200);
  };

  const buttonClass =
    "select-none flex items-center justify-center rounded-full bg-gray-700 text-white transition-all duration-200 focus:outline-none active:scale-95 touch-manipulation";
  const activeClass = "bg-blue-500";

  return (
    <div
      className={`${className} ${
        layout === 'horizontal' ? 'flex-row space-x-2' : 'flex-col space-y-2'
      } flex items-center justify-center`}
    >
      {/* Przyciski sterowania */}
      <button
        className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 ${
          activeButton === 'up' || currentDirection === 'up' ? activeClass : ''
        }`}
        onClick={() => handleButtonPress('up')}
        aria-label="Move up"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <div className="flex flex-row items-center space-x-2">
        <button
          className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 ${
            activeButton === 'left' || currentDirection === 'left' ? activeClass : ''
          }`}
          onClick={() => handleButtonPress('left')}
          aria-label="Move left"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-12 h-12 sm:w-14 sm:h-14"></div> {/* Pusty środek */}
        <button
          className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 ${
            activeButton === 'right' || currentDirection === 'right' ? activeClass : ''
          }`}
          onClick={() => handleButtonPress('right')}
          aria-label="Move right"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <button
        className={`${buttonClass} w-12 h-12 sm:w-14 sm:h-14 ${
          activeButton === 'down' || currentDirection === 'down' ? activeClass : ''
        }`}
        onClick={() => handleButtonPress('down')}
        aria-label="Move down"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

export default DirectionalControls;
