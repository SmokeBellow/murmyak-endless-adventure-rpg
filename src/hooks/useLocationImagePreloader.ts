import { useState, useRef } from 'react';
import { LocationType } from '@/types/gameTypes';

// Изображения для каждой локации
const locationImages: Record<LocationType, string[]> = {
  village: [
    '/player.png',
    '/walk_down1.png',
    '/walk_down2.png',
    '/walk_down3.png',
    '/walk_side1.png',
    '/walk_side2.png',
    '/walk_side3.png',
    '/walk_up1.png',
    '/walk_up2.png',
    '/walk_up3.png',
    '/grass.png',
    '/house.png',
    '/blacksmith.png',
    '/headman.png',
    '/trademan.png',
    '/fountain.png',
    '/chastokol.png',
    '/chastokol_left.png',
    '/chastokol_side.png',
    '/forest.png',
    '/blacksmith_image.png',
    '/headman_image.png',
    '/trademan_image.png',
    '/old_sword.png',
    '/sword.png',
    '/leatherarmor.png',
    '/steelarmor.png',
    '/healthpotion.png',
    '/weapon_empty.png',
    '/armor_empty.png',
    '/helmet_empty.png',
    '/boots_empty.png',
    '/shield_empty.png',
    '/amulet_empty.png'
  ],
  'abandoned-mines': [
    '/player.png',
    '/player_fight.png',
    '/walk_down1.png',
    '/walk_down2.png',
    '/walk_down3.png',
    '/walk_side1.png',
    '/walk_side2.png',
    '/walk_side3.png',
    '/walk_up1.png',
    '/walk_up2.png',
    '/walk_up3.png',
    '/mines_entrance.png',
    '/mines_fight_background.png',
    '/torch.png',
    '/treasure_chest.png',
    '/rat.png',
    '/rat1.png',
    '/rat2.png',
    '/trash_gem.png',
    '/trash_nail.png',
    '/trash_old_coin.png',
    '/trash_rare_gem.png'
  ],
  darkforest: [
    '/player.png',
    '/player_fight.png',
    '/walk_down1.png',
    '/walk_down2.png',
    '/walk_down3.png',
    '/walk_side1.png',
    '/walk_side2.png',
    '/walk_side3.png',
    '/walk_up1.png',
    '/walk_up2.png',
    '/walk_up3.png',
    '/bat.png',
    '/bat1.png',
    '/bat2.png',
    '/bat3.png'
  ]
};

export const useLocationImagePreloader = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const resetProgress = () => {
    setLoadingProgress(0);
  };

  const preloadLocationImages = async (location: LocationType): Promise<void> => {
    const images = locationImages[location];
    if (!images || images.length === 0) {
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);

    const loadedCountRef = { current: 0 };
    const totalImages = images.length;

    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCountRef.current++;
          const progress = Math.round((loadedCountRef.current / totalImages) * 100);
          console.log(`Loaded ${loadedCountRef.current}/${totalImages} images (${progress}%)`);
          setLoadingProgress(progress);
          resolve();
        };
        img.onerror = () => {
          loadedCountRef.current++;
          const progress = Math.round((loadedCountRef.current / totalImages) * 100);
          console.log(`Failed to load image ${src}, progress: ${loadedCountRef.current}/${totalImages} (${progress}%)`);
          setLoadingProgress(progress);
          resolve();
        };
        img.src = src;
      });
    };

    try {
      await Promise.all(images.map(loadImage));
    } catch (error) {
      console.error('Error preloading location images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { preloadLocationImages, loadingProgress, isLoading, resetProgress };
};
