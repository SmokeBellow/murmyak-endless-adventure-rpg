import { useState, useRef, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (direction: { x: number; y: number } | null) => void;
  disabled?: boolean;
}

const VirtualJoystick = ({ onMove, disabled }: VirtualJoystickProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  
  const joystickRadius = 60;
  const knobRadius = 20;
  const deadZone = 15;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
  }, [disabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current || disabled) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Limit knob to joystick boundary
    const maxDistance = joystickRadius - knobRadius;
    const limitedDistance = Math.min(distance, maxDistance);
    
    let newX = 0;
    let newY = 0;
    
    if (distance > 0) {
      newX = (deltaX / distance) * limitedDistance;
      newY = (deltaY / distance) * limitedDistance;
    }
    
    setKnobPosition({ x: newX, y: newY });
    
    // Calculate direction for movement
    if (limitedDistance > deadZone) {
      const normalizedX = newX / maxDistance;
      const normalizedY = newY / maxDistance;
      onMove({ x: normalizedX, y: normalizedY });
    } else {
      onMove(null);
    }
  }, [isDragging, disabled, onMove, joystickRadius, knobRadius, deadZone]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove(null);
  }, [onMove]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handleMove(touch.clientX, touch.clientY);
    }
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <div
        ref={joystickRef}
        className="relative bg-card/90 backdrop-blur-sm border-2 border-border rounded-full shadow-medieval"
        style={{
          width: joystickRadius * 2,
          height: joystickRadius * 2,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Outer ring */}
        <div className="absolute inset-2 border border-primary/30 rounded-full" />
        
        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute bg-primary rounded-full shadow-glow cursor-pointer transition-all"
          style={{
            width: knobRadius * 2,
            height: knobRadius * 2,
            left: joystickRadius - knobRadius + knobPosition.x,
            top: joystickRadius - knobRadius + knobPosition.y,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        
        {/* Center dot when not active */}
        {!isDragging && (
          <div 
            className="absolute bg-primary/50 rounded-full pointer-events-none"
            style={{
              width: 8,
              height: 8,
              left: joystickRadius - 4,
              top: joystickRadius - 4,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VirtualJoystick;