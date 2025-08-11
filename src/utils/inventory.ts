import { Item } from '@/types/gameTypes';

export const addItemToInventory = (inventory: Item[], newItem: Item): Item[] => {
  // Check if item is stackable (consumables and misc items are stackable by default)
  const isStackable = newItem.stackable !== false && (newItem.type === 'consumable' || newItem.type === 'misc');
  const maxStack = newItem.maxStack || 10;

  if (!isStackable) {
    // Non-stackable items get added as separate entries
    return [...inventory, { ...newItem, quantity: 1 }];
  }

  // Find existing stack with same name and type (excluding equipment)
  const existingStackIndex = inventory.findIndex(item => 
    item.name === newItem.name && 
    item.type === newItem.type && 
    !item.slot && // Don't stack equipment
    (item.quantity || 1) < maxStack
  );

  if (existingStackIndex >= 0) {
    // Add to existing stack
    const updatedInventory = [...inventory];
    const existingItem = updatedInventory[existingStackIndex];
    const currentQuantity = existingItem.quantity || 1;
    const newQuantity = Math.min(currentQuantity + 1, maxStack);
    
    updatedInventory[existingStackIndex] = {
      ...existingItem,
      quantity: newQuantity
    };

    // If we couldn't add all items to the stack, create a new stack
    if (newQuantity < currentQuantity + 1) {
      updatedInventory.push({ ...newItem, quantity: 1 });
    }

    return updatedInventory;
  } else {
    // Create new stack
    return [...inventory, { ...newItem, quantity: 1 }];
  }
};

export const addItemsToInventory = (inventory: Item[], items: Item[]): Item[] => {
  let updatedInventory = [...inventory];
  
  for (const item of items) {
    updatedInventory = addItemToInventory(updatedInventory, item);
  }
  
  return updatedInventory;
};

export const removeItemFromInventory = (inventory: Item[], itemId: string, quantity: number = 1): Item[] => {
  const itemIndex = inventory.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    return inventory;
  }

  const updatedInventory = [...inventory];
  const item = updatedInventory[itemIndex];
  const currentQuantity = item.quantity || 1;

  if (currentQuantity <= quantity) {
    // Remove the entire stack
    updatedInventory.splice(itemIndex, 1);
  } else {
    // Reduce quantity
    updatedInventory[itemIndex] = {
      ...item,
      quantity: currentQuantity - quantity
    };
  }

  return updatedInventory;
};

export const getItemQuantity = (inventory: Item[], itemId: string): number => {
  const item = inventory.find(item => item.id === itemId);
  return item ? (item.quantity || 1) : 0;
};

export const getTotalItemQuantity = (inventory: Item[], itemName: string): number => {
  return inventory
    .filter(item => item.name === itemName)
    .reduce((total, item) => total + (item.quantity || 1), 0);
};

export const getSellPrice = (item: Item): number => {
  return item.price ? Math.max(1, Math.floor(item.price * 0.5)) : 1;
};