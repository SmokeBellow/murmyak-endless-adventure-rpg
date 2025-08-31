import React, { useState, useEffect } from 'react';
import { NPC } from '@/types/gameTypes';
import { Button } from '@/components/ui/button';
import { dialoguesData } from '@/data/dialogues';
import { DialogueState, DialogueOption } from '@/types/dialogueTypes';
import { availableSkills } from '@/data/skills';

interface VisualNovelDialogueProps {
  npc: NPC;
  onClose: () => void;
  onQuestAccept?: (questId: string) => void;
  hasActiveVillageQuest?: boolean;
  hasCompletedVillageQuest?: boolean;
  onTrade?: () => void;
  firstMerchantTalk?: boolean;
  firstBlacksmithTalk?: boolean;
  onMarkConversation?: (npcType: 'merchant' | 'blacksmith') => void;
  playerSkillUsageStats?: {
    warrior: number;
    rogue: number;
    mage: number;
  };
  onClassSelection?: (classType: 'warrior' | 'rogue' | 'mage') => void;
}

const VisualNovelDialogue = ({ npc, onClose, onQuestAccept, hasActiveVillageQuest, hasCompletedVillageQuest, onTrade, firstMerchantTalk, firstBlacksmithTalk, onMarkConversation, playerSkillUsageStats, onClassSelection }: VisualNovelDialogueProps) => {
  const getDialogueKey = () => {
    switch (npc.type) {
      case 'elder':
        if (hasCompletedVillageQuest) {
          return 'starosta_quest_completed';
        } else if (hasActiveVillageQuest) {
          return 'starosta_quest_active';
        }
        return 'starosta';
      case 'merchant':
        if (!firstMerchantTalk) {
          return 'torgovec_return';
        } else if (hasActiveVillageQuest) {
          return 'torgovec';
        } else {
          return 'torgovec_no_quest';
        }
      case 'blacksmith':
        if (!firstBlacksmithTalk) {
          return 'kuznec_return';
        } else if (hasActiveVillageQuest) {
          return 'kuznec';
        } else {
          return 'kuznec_no_quest';
        }
      default:
        return 'starosta';
    }
  };

  const currentDialogue = dialoguesData.dialogs[getDialogueKey()];

  const [dialogueState, setDialogueState] = useState<DialogueState>({
    currentSpeaker: 'npc',
    currentText: currentDialogue.text,
    currentOptions: currentDialogue.options,
    showOptions: false,
    dialogueStack: []
  });

const [displayedNPCText, setDisplayedNPCText] = useState('');
const [displayedPlayerText, setDisplayedPlayerText] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [pendingTrade, setPendingTrade] = useState(false);

  // Check class availability
  const mageUnlockedCount = availableSkills.filter(skill => skill.unlocked && skill.class === 'mage').length;
  const rogueUnlockedCount = availableSkills.filter(skill => skill.unlocked && skill.class === 'rogue').length;
  const warriorUnlockedCount = availableSkills.filter(skill => skill.unlocked && skill.class === 'warrior').length;

  const canGetMageClass = npc.type === 'mage' && playerSkillUsageStats && 
    playerSkillUsageStats.mage >= 1 && 
    mageUnlockedCount >= 2;
  const canGetRogueClass = npc.type === 'scout' && playerSkillUsageStats && 
    playerSkillUsageStats.rogue >= 1 && 
    rogueUnlockedCount >= 2;  
  const canGetWarriorClass = npc.type === 'guardian' && playerSkillUsageStats && 
    playerSkillUsageStats.warrior >= 1 && 
    warriorUnlockedCount >= 2;

  // Typing effect for NPC text
  useEffect(() => {
    if (dialogueState.currentSpeaker === 'npc') {
      setIsTyping(true);
      setDisplayedNPCText('');
      
      const text = dialogueState.currentText;
      let currentIndex = 0;
      
const typeTimer = setInterval(() => {
  if (currentIndex < text.length) {
    setDisplayedNPCText(text.substring(0, currentIndex + 1));
    currentIndex++;
  } else {
    clearInterval(typeTimer);
    setIsTyping(false);

    // If trade is pending (merchant dialogue), open trade after short pause
    if (pendingTrade && onTrade) {
      setTimeout(() => {
        setPendingTrade(false);
        onTrade();
      }, 400);
    }

    // Show options after typing is complete
    setTimeout(() => {
      setDialogueState(prev => ({
        ...prev,
        showOptions: true
      }));
    }, 500);
  }
}, 50); // 50ms per character

      return () => clearInterval(typeTimer);
    }
}, [dialogueState.currentSpeaker, dialogueState.currentText, pendingTrade, onTrade]);

  // Update player text when player speaks
  useEffect(() => {
    if (dialogueState.currentSpeaker === 'player') {
      setDisplayedPlayerText(dialogueState.currentText);
    } else {
      setDisplayedPlayerText('');
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

  const handlePlayerChoice = (option: DialogueOption) => {
    setDialogueState({
      currentSpeaker: 'player',
      currentText: option.player,
      currentOptions: [],
      showOptions: false,
      dialogueStack: [...dialogueState.dialogueStack, option]
    });

    // Mark first conversation as done
    if (firstMerchantTalk && npc.type === 'merchant' && onMarkConversation) {
      onMarkConversation('merchant');
    }
    if (firstBlacksmithTalk && npc.type === 'blacksmith' && onMarkConversation) {
      onMarkConversation('blacksmith');
    }

// Check for quest-triggering responses
const isQuestTrigger = (
  (npc.type === 'elder' && option.player === 'С кем мне стоит поговорить?') ||
  (npc.type === 'merchant' && option.player === 'Договорились.') ||
  (npc.type === 'blacksmith' && option.player === 'Согласен помочь!')
);

// Check for trade-triggering responses (merchant)
const isTradeTrigger = (
  npc.type === 'merchant' && (
    option.player === 'Покажи свои товары.' ||
    option.player === 'Просто хотел посмотреть товары.'
  )
);

    // After player speaks, NPC responds
    setTimeout(() => {
      // If this is the last response in the branch (no more options), close after showing it
      const hasMoreOptions = option.options && option.options.length > 0;
      
      setDialogueState({
        currentSpeaker: 'npc',
        currentText: option.response,
        currentOptions: option.options || [],
        showOptions: false,
        dialogueStack: [...dialogueState.dialogueStack, option]
      });

// If quest should be triggered, call the callback
if (isQuestTrigger && onQuestAccept) {
  let questId = '';
  if (npc.type === 'elder') questId = 'village-defense';
  else if (npc.type === 'merchant') questId = 'wolf-pelts';
  else if (npc.type === 'blacksmith') questId = 'ore-mining';
  
  if (questId) {
    onQuestAccept(questId);
  }
}

// If trade should be triggered, mark pending to open after NPC response is typed
if (isTradeTrigger) {
  setPendingTrade(true);
}

// No auto-close, let user manually close via button
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

      {/* Dialogue menu - Bottom 30% */}
      <div className="h-[30%] bg-gradient-to-t from-black/95 to-black/80 border-t border-white/20 flex flex-col px-8 mb-[2vh]">
        {/* NPC Text - Top half */}
        <div className="h-1/2 flex flex-col justify-center space-y-2 border-b border-white/10 pb-2">
          <div className="text-sm text-gray-400">
            {npc.name}:
          </div>
          <div className="text-lg text-white leading-relaxed">
            {displayedNPCText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>
        </div>

        {/* Player Text or Options - Bottom half */}
        <div className="h-1/2 flex flex-col justify-center space-y-2 pt-2">
          {dialogueState.showOptions && dialogueState.currentSpeaker === 'npc' ? (
            // Show player options or end dialogue button
            <>
              <div className="text-sm text-gray-400">
                {dialogueState.currentOptions.length > 0 ? 'Выберите ответ:' : ''}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {dialogueState.currentOptions.length > 0 ? (
                  <>
                    {dialogueState.currentOptions.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-200"
                        onClick={() => handlePlayerChoice(option)}
                      >
                        {option.player}
                      </Button>
                    ))}
                    {(canGetMageClass || canGetRogueClass || canGetWarriorClass) && (
                      <Button 
                        variant="default" 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold"
                        onClick={() => {
                          if (canGetMageClass) onClassSelection?.('mage');
                          else if (canGetRogueClass) onClassSelection?.('rogue');
                          else if (canGetWarriorClass) onClassSelection?.('warrior');
                        }}
                      >
                        ✨ Выбрать класс
                        {canGetMageClass && ' (Маг)'}
                        {canGetRogueClass && ' (Следопыт)'}
                        {canGetWarriorClass && ' (Воин)'}
                      </Button>
                    )}
                  </>
                 ) : (
                   <>
                     <Button
                       variant="outline"
                       className="bg-red-500/20 border-red-500/50 text-white hover:bg-red-500/30 transition-all duration-200"
                       onClick={onClose}
                     >
                       Уйти
                     </Button>
                     {/* Class Selection Button */}
                     {(canGetMageClass || canGetRogueClass || canGetWarriorClass) && (
                       <Button 
                         variant="default" 
                         className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold"
                         onClick={() => {
                           if (canGetMageClass) onClassSelection?.('mage');
                           else if (canGetRogueClass) onClassSelection?.('rogue');
                           else if (canGetWarriorClass) onClassSelection?.('warrior');
                         }}
                        >
                          ✨ Выбрать класс
                          {canGetMageClass && ' (Маг)'}
                          {canGetRogueClass && ' (Следопыт)'}
                          {canGetWarriorClass && ' (Воин)'}
                        </Button>
                     )}
                   </>
                 )}
              </div>
            </>
          ) : displayedPlayerText ? (
            // Show player text only if there is text
            <>
              <div className="text-sm text-gray-400">Герой:</div>
              <div className="text-lg text-white leading-relaxed min-h-[1.5rem]">
                {displayedPlayerText}
              </div>
            </>
          ) : (
            // Empty space when NPC is typing
            <div className="min-h-[1.5rem]"></div>
          )}
        </div>

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