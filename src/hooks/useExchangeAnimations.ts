import { useCallback } from 'react';
import { withSpring, cancelAnimation } from 'react-native-reanimated';
import { ANIMATION_CONFIG } from '../constants/animations';
import { SharedValue } from 'react-native-reanimated';

interface UseExchangeAnimationsProps {
  fromSectionTranslateX: SharedValue<number>;
  toSectionTranslateX: SharedValue<number>;
  fromSectionOpacity: SharedValue<number>;
  toSectionOpacity: SharedValue<number>;
  handleSwapCurrencies: () => void;
  conversionDirection: 'crypto-to-fiat' | 'fiat-to-crypto';
}

export const useExchangeAnimations = ({
  fromSectionTranslateX,
  toSectionTranslateX,
  fromSectionOpacity,
  toSectionOpacity,
  handleSwapCurrencies,
  conversionDirection,
}: UseExchangeAnimationsProps) => {
  
  const handleSwapWithAnimation = useCallback(() => {
    cancelAnimation(fromSectionTranslateX);
    cancelAnimation(toSectionTranslateX);
    cancelAnimation(fromSectionOpacity);
    cancelAnimation(toSectionOpacity);
    
    const slideDirection = conversionDirection === 'crypto-to-fiat' ? ANIMATION_CONFIG.VALUES.SLIDE_DISTANCE : -ANIMATION_CONFIG.VALUES.SLIDE_DISTANCE;
    
    fromSectionTranslateX.value = withSpring(slideDirection, ANIMATION_CONFIG.SPRING.MEDIUM);
    fromSectionOpacity.value = withSpring(0, { damping: 30, stiffness: 400 });
    
    toSectionTranslateX.value = withSpring(-slideDirection, ANIMATION_CONFIG.SPRING.MEDIUM);
    toSectionOpacity.value = withSpring(0, { damping: 30, stiffness: 400 });
    
    setTimeout(() => {
      handleSwapCurrencies();
      
      fromSectionTranslateX.value = slideDirection;
      fromSectionOpacity.value = 0;
      fromSectionTranslateX.value = withSpring(0, ANIMATION_CONFIG.SPRING.MEDIUM);
      fromSectionOpacity.value = withSpring(1, { damping: 30, stiffness: 400 });
      
      toSectionTranslateX.value = -slideDirection;
      toSectionOpacity.value = 0;
      toSectionTranslateX.value = withSpring(0, ANIMATION_CONFIG.SPRING.MEDIUM);
      toSectionOpacity.value = withSpring(1, { damping: 30, stiffness: 400 });
    }, ANIMATION_CONFIG.TIMING.SWAP_DELAY);
  }, [fromSectionTranslateX, toSectionTranslateX, fromSectionOpacity, toSectionOpacity, handleSwapCurrencies, conversionDirection]);

  return { handleSwapWithAnimation };
};
