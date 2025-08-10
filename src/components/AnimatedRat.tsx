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
      setCurrentFrame(prev => (prev === 1 ? 2 : 1));
    }, 800); // Change frame every 800ms

    return () => clearInterval(interval);
  }, []);

  // Rotate sprite so the TOP of the image points in the movement direction.
  const rotation =
    direction === 'up' ? 'rotate(0deg)' :
    direction === 'right' ? 'rotate(90deg)' :
    direction === 'down' ? 'rotate(180deg)' :
    direction === 'left' ? 'rotate(-90deg)' : '';

  const combinedStyle: React.CSSProperties = {
    ...(style || {}),
    transform: `${style?.transform ?? ''} ${rotation}`.trim()
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
