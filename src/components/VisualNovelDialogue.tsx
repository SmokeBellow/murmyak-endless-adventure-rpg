import React, { useState, useEffect } from 'react';
import { NPC } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';

interface VisualNovelDialogueProps {
  npc: NPC;
  onClose: () => void;
}

interface DialogueState {
  currentSpeaker: 'npc' | 'player';
  currentText: string;
  playerOptions: string[];
  showOptions: boolean;
}

const VisualNovelDialogue = ({ npc, onClose }: VisualNovelDialogueProps) => {
  const [dialogueState, setDialogueState] = useState<DialogueState>({
    currentSpeaker: 'npc',
    currentText: npc.dialogue[0] || 'Привет!',
    playerOptions: ['Привет!', 'Как дела?', 'Увидимся позже'],
    showOptions: false
  });

  // Automatically show player options after NPC finishes speaking
  useEffect(() => {
    if (dialogueState.currentSpeaker === 'npc') {
      const timer = setTimeout(() => {
        setDialogueState(prev => ({
          ...prev,
          showOptions: true
        }));
      }, 2000); // Show options after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [dialogueState.currentSpeaker, dialogueState.currentText]);

  const getNPCImage = () => {
    switch (npc.type) {
      case 'elder':
        return '/headman_image.png';
      case 'merchant':
        return '/trademan_image.png';
      case 'blacksmith':
        return '/blacksmith_image.png';
      default:
        return '/headman_image.png';
    }
  };

  const handlePlayerChoice = (choice: string) => {
    setDialogueState({
      currentSpeaker: 'player',
      currentText: choice,
      playerOptions: [],
      showOptions: false
    });

    // After player speaks, NPC responds
    setTimeout(() => {
      const randomResponse = npc.dialogue[Math.floor(Math.random() * npc.dialogue.length)];
      setDialogueState({
        currentSpeaker: 'npc',
        currentText: randomResponse,
        playerOptions: ['Интересно!', 'Расскажи еще', 'Понятно', 'Пока!'],
        showOptions: false
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Main dialogue area */}
      <div className="flex-1 flex">
        {/* NPC Image - Left third */}
        <div className="w-1/3 flex items-center justify-center relative">
          <div 
            className={`w-80 h-80 rounded-lg overflow-hidden transition-all duration-500 ${
              dialogueState.currentSpeaker === 'npc' ? 'opacity-100 scale-105' : 'opacity-60 scale-95'
            }`}
          >
            <img 
              src={getNPCImage()} 
              alt="NPC" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* NPC name label */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">
            <span className="font-bold text-lg">{npc.name}</span>
          </div>
        </div>

        {/* Middle empty space */}
        <div className="w-1/3"></div>

        {/* Player Image - Right third */}
        <div className="w-1/3 flex items-center justify-center relative">
          <div 
            className={`w-80 h-80 rounded-lg overflow-hidden transition-all duration-500 ${
              dialogueState.currentSpeaker === 'player' ? 'opacity-100 scale-105' : 'opacity-60 scale-95'
            }`}
          >
            <img 
              src="/player_image.png" 
              alt="Player" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          
          {/* Player name label */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg">
            <span className="font-bold text-lg">Герой</span>
          </div>
        </div>
      </div>

      {/* Dialogue menu - Bottom 15% */}
      <div className="h-[15%] bg-gradient-to-t from-black/95 to-black/80 border-t border-white/20 flex flex-col justify-center px-8 mb-[2vh]">
        {dialogueState.showOptions && dialogueState.currentSpeaker === 'npc' ? (
          // Player choice options
          <div className="space-y-2">
            <div className="text-sm text-gray-400 mb-2">Выберите ответ:</div>
            <div className="grid grid-cols-2 gap-3">
              {dialogueState.playerOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left justify-start bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-200"
                  onClick={() => handlePlayerChoice(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Current speaker's text
          <div className="space-y-3">
            <div className="text-sm text-gray-400">
              {dialogueState.currentSpeaker === 'npc' ? npc.name : 'Герой'}:
            </div>
            <div className="text-lg text-white leading-relaxed">
              {dialogueState.currentText}
            </div>
            {dialogueState.currentSpeaker === 'npc' && !dialogueState.showOptions && (
              <div className="text-xs text-gray-500 animate-pulse">
                Ожидание ответа...
              </div>
            )}
          </div>
        )}

        {/* Close button */}
        <Button
          variant="ghost"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          ✕ Закрыть
        </Button>
      </div>
    </div>
  );
};

export default VisualNovelDialogue;