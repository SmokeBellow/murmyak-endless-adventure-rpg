import { useState, useEffect } from 'react';

interface AnimatedRatProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const AnimatedRat = ({ className, alt = "Rat", style, onError }: AnimatedRatProps) => {
  const [currentFrame, setCurrentFrame] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => prev === 1 ? 2 : 1);
    }, 800); // Change frame every 800ms

    return () => clearInterval(interval);
  }, []);

  return (
    <img 
      src={`/rat${currentFrame}.png`}
      alt={alt}
      className={className}
      style={style}
      onError={onError}
    />
  );
};