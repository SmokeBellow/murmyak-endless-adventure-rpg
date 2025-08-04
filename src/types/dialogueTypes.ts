export interface DialogueOption {
  player: string;
  response: string;
  options?: DialogueOption[];
}

export interface DialogueData {
  id: string;
  npc: string;
  text: string;
  options: DialogueOption[];
}

export interface DialogueDatabase {
  dialogs: {
    [key: string]: DialogueData;
  };
}

export interface DialogueState {
  currentSpeaker: 'npc' | 'player';
  currentText: string;
  currentOptions: DialogueOption[];
  showOptions: boolean;
  dialogueStack: DialogueOption[];
}