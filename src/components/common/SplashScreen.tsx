import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLemon } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import RNSplashScreen from 'react-native-splash-screen';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]);

    animation.start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (RNSplashScreen) {
            RNSplashScreen.hide();
          }
          onAnimationComplete?.();
        });
      }, 500);
    });
  }, [scaleAnim, opacityAnim, rotateAnim, onAnimationComplete]);

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: opacityAnim,
            transform: [
              {
                scale: scaleAnim,
              },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesomeIcon
          icon={faLemon}
          size={80}
          color={colors.lemon}
        />
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SplashScreen;
