import { useState, useEffect } from 'react';

// Список всех изображений игры для предзагрузки
const gameImages = [
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
  '/mines_entrance.png',
  '/mines_fight_background.png',
  '/torch.png',
  '/treasure_chest.png',
  '/rat.png',
  '/rat1.png',
  '/rat2.png',
  '/bat.png',
  '/bat1.png',
  '/bat2.png',
  '/bat3.png',
  '/old_sword.png',
  '/sword.png',
  '/leatherarmor.png',
  '/steelarmor.png',
  '/healthpotion.png',
  '/trash_gem.png',
  '/trash_nail.png',
  '/trash_old_coin.png',
  '/trash_rare_gem.png',
  '/weapon_empty.png',
  '/armor_empty.png',
  '/helmet_empty.png',
  '/boots_empty.png',
  '/shield_empty.png',
  '/amulet_empty.png',
  '/blacksmith_image.png',
  '/headman_image.png',
  '/trademan_image.png'
];

export const useImagePreloader = () => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = gameImages.length;

    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
          resolve();
        };
        img.onerror = () => {
          // Даже если изображение не загрузилось, продолжаем
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
          resolve();
        };
        img.src = src;
      });
    };

    const preloadImages = async () => {
      try {
        await Promise.all(gameImages.map(loadImage));
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Продолжаем даже при ошибках
      }
    };

    preloadImages();
  }, []);

  return { imagesLoaded, loadingProgress };
};
