import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

interface ConversionDirectionToggleProps {
  direction: 'crypto-to-fiat' | 'fiat-to-crypto';
  onDirectionChange: (direction: 'crypto-to-fiat' | 'fiat-to-crypto') => void;
}

const ConversionDirectionToggle: React.FC<ConversionDirectionToggleProps> = ({
  direction,
  onDirectionChange,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const animationValue = useSharedValue(direction === 'fiat-to-crypto' ? 1 : 0);

  useEffect(() => {
    animationValue.value = withSpring(direction === 'fiat-to-crypto' ? 1 : 0, {
      damping: 30,
      stiffness: 300,
    });
  }, [direction, animationValue]);

  const handleTap = (newDirection: 'crypto-to-fiat' | 'fiat-to-crypto') => {
    const targetValue = newDirection === 'fiat-to-crypto' ? 1 : 0;
    animationValue.value = withSpring(targetValue, {
      damping: 30,
      stiffness: 300,
    });
    
    onDirectionChange(newDirection);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const indicatorWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;
    const translateX = interpolate(animationValue.value, [0, 1], [0, indicatorWidth]); 
    
    return {
      transform: [{ translateX }],
    };
  });

  const animatedTextStyle1 = useAnimatedStyle(() => {
    const opacity = interpolate(animationValue.value, [0, 1], [1, 0.6]);
    return { opacity };
  });

  const animatedTextStyle2 = useAnimatedStyle(() => {
    const opacity = interpolate(animationValue.value, [0, 1], [0.6, 1]);
    return { opacity };
  });

  return (
    <View 
      style={styles.directionToggle}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />
      
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => handleTap('crypto-to-fiat')}
      >
        <Animated.Text style={[
          styles.toggleButtonText,
          direction === 'crypto-to-fiat' && styles.activeToggleButtonText,
          animatedTextStyle1
        ]}>
          Crypto → Fiat
        </Animated.Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => handleTap('fiat-to-crypto')}
      >
        <Animated.Text style={[
          styles.toggleButtonText,
          direction === 'fiat-to-crypto' && styles.activeToggleButtonText,
          animatedTextStyle2
        ]}>
          Fiat → Crypto
        </Animated.Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  directionToggle: {
    flexDirection: 'row',
    marginHorizontal: 40,
    marginTop: Platform.OS === 'android' ? 20 : 8,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: '50%',
    bottom: 4,
    backgroundColor: colors.lemon,
    borderRadius: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  activeToggleButton: {
    backgroundColor: 'transparent',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.themeTextSecondary,
  },
  activeToggleButtonText: {
    color: colors.darkBackground,
  },
});

export default ConversionDirectionToggle;
