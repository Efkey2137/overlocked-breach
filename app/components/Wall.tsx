import React from 'react';

interface WallProps {
  x: number;
  y: number;
  width: number;
  height: number;
  cellSize: number;
}

const Wall: React.FC<WallProps> = ({ x, y, width, height, cellSize }) => {
  return (
    <div 
      className="absolute bg-gray-700" 
      style={{
        left: x * cellSize,
        top: y * cellSize,
        width: width * cellSize,
        height: height * cellSize,
      }}
    />
  );
};

export default Wall;
