import React, { useEffect, useRef } from 'react';
import styles from '../Home.module.css';

interface EnemyProps {
  position: { x: number; y: number };
  speed: { x: number; y: number };
  playerPosition: { x: number; y: number };
  onCollision: () => void;
}

const Enemy: React.FC<EnemyProps> = ({ position, speed, playerPosition, onCollision }) => {
  const enemyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkCollision = () => {
      if (enemyRef.current) {
        const enemyRect = enemyRef.current.getBoundingClientRect();
        const playerRect = {
          left: playerPosition.x,
          top: playerPosition.y,
          right: playerPosition.x + 20, // Zakładając, że gracz ma szerokość 20px
          bottom: playerPosition.y + 20, // Zakładając, że gracz ma wysokość 20px
        };
        
        if (
          enemyRect.left < playerRect.right &&
          enemyRect.right > playerRect.left &&
          enemyRect.top < playerRect.bottom &&
          enemyRect.bottom > playerRect.top
        ) {
          onCollision();
        }
      }
    };
    
    const interval = setInterval(checkCollision, 16); // Około 60 FPS
    
    return () => clearInterval(interval);
  }, [playerPosition, onCollision]);
  
  return (
    <div 
      ref={enemyRef}
      className={styles.enemy}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    />
  );
};

export default Enemy;
