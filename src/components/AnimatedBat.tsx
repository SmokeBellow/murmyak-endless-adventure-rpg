import { useState, useEffect } from 'react';

interface AnimatedBatProps {
  className?: string;
  alt?: string;
  isAttacking?: boolean;
  direction?: string;
}

const AnimatedBat = ({ className = '', alt = 'Летучая мышь', isAttacking = false, direction }: AnimatedBatProps) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => prev === 3 ? 1 : prev + 1);
    }, 200); // Change frame every 200ms
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <img 
      src={`/bat${currentFrame}.png`}
      alt={alt}
      className={`${className} ${isAttacking ? 'filter brightness-150 scale-110' : ''} ${
        direction === 'left' ? 'scale-x-[-1]' : ''
      }`}
      style={{
        imageRendering: 'pixelated',
        filter: isAttacking ? 'brightness(1.5) saturate(1.2)' : 'none'
      }}
    />
  );
};

export default AnimatedBat;