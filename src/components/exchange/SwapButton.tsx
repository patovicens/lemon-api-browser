import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

interface SwapButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

const SwapButton: React.FC<SwapButtonProps> = ({ onPress, isLoading = false }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.swapButton} onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.themeBackground} />
      ) : (
        <FontAwesomeIcon icon={faArrowsAltV} size={16} color={colors.themeBackground} />
      )}
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
