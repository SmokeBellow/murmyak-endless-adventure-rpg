import { useState, useEffect } from 'react';

interface AnimatedRatProps {
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const AnimatedRat = ({ className, alt = "Rat", style, onError, direction = 'right' }: AnimatedRatProps) => {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [useUppercaseExt, setUseUppercaseExt] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => prev === 1 ? 2 : 1);
    }, 800); // Change frame every 800ms

    return () => clearInterval(interval);
  }, []);

  const directionTransform =
    direction === 'left' ? 'scaleX(-1)' :
    direction === 'up' ? 'rotate(-90deg)' :
    direction === 'down' ? 'rotate(90deg)' : '';

  const combinedStyle: React.CSSProperties = {
    ...(style || {}),
    transform: `${style?.transform ?? ''} ${directionTransform}`.trim()
  };

  return (
    <img 
      src={`/rat${currentFrame}.${useUppercaseExt ? 'PNG' : 'png'}`}
      alt={alt}
      className={className}
      style={combinedStyle}
      onError={(e) => {
        onError?.(e);
        setUseUppercaseExt(true);
      }}
    />
  );
};