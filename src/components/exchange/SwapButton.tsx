import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

interface SwapButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onPress, isLoading = false }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const scaleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: rotation.value + 'deg' }],
    };
  });

  const handlePress = () => {
    if (isLoading) return;
    
    onPress();
    
    cancelAnimation(scale);
    cancelAnimation(rotation);
    
    scale.value = 1;
    rotation.value = 0;
    
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    
    rotation.value = withSequence(
      withSpring(180, { damping: 15, stiffness: 300 }),
      withSpring(360, { damping: 15, stiffness: 300 }, () => {
        rotation.value = 0;
      })
    );
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[styles.swapButton, scaleStyle]}>
        <Animated.View style={rotationStyle}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.themeBackground} />
          ) : (
            <FontAwesomeIcon icon={faArrowsAltV} size={16} color={colors.themeBackground} />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  swapButton: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lemon,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.lemon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SwapButton;
