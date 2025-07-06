import { useEffect, useState } from 'react';

interface GameIntroProps {
  onComplete: () => void;
}

const GameIntro = ({ onComplete }: GameIntroProps) => {
  const [currentScreen, setCurrentScreen] = useState<'developer' | 'title' | 'complete'>('developer');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setCurrentScreen('title');
    }, 3000);

    const timer2 = setTimeout(() => {
      setCurrentScreen('complete');
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (currentScreen === 'complete') return null;

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 animate-fade-in">
      {currentScreen === 'developer' && (
        <div className="text-center animate-scale-in">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            MurMyak Games
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded"></div>
        </div>
      )}
      
      {currentScreen === 'title' && (
        <div className="text-center animate-scale-in">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-6">
            Endless Adventure
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Средневековое Фэнтези Приключение
          </p>
          <div className="mt-8">
            <div className="w-32 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded mb-2"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-accent to-primary mx-auto rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameIntro;