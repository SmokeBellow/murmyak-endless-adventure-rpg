import { Player } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';

interface MobileControlsProps {
  player: Player;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  disabled?: boolean;
}

const MobileControls = ({ player, onMove, disabled }: MobileControlsProps) => {
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (disabled) return;
    
    const { x, y } = player.position;
    let newX = x;
    let newY = y;
    
    switch (direction) {
      case 'up':
        newY = Math.max(0, y - 1);
        break;
      case 'down':
        newY = Math.min(19, y + 1);
        break;
      case 'left':
        newX = Math.max(0, x - 1);
        break;
      case 'right':
        newX = Math.min(19, x + 1);
        break;
    }
    
    if (newX !== x || newY !== y) {
      onMove(direction);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-medieval">
      <div className="grid grid-cols-3 gap-2 w-32 h-32">
        <div></div>
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => handleMove('up')}
          disabled={disabled}
        >
          ↑
        </Button>
        <div></div>
        
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => handleMove('left')}
          disabled={disabled}
        >
          ←
        </Button>
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-primary rounded-full opacity-50"></div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => handleMove('right')}
          disabled={disabled}
        >
          →
        </Button>
        
        <div></div>
        <Button
          variant="secondary"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => handleMove('down')}
          disabled={disabled}
        >
          ↓
        </Button>
        <div></div>
      </div>
    </div>
  );
};

export default MobileControls;