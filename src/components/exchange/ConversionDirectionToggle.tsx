import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.directionToggle}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          direction === 'crypto-to-fiat' && styles.activeToggleButton
        ]}
        onPress={() => onDirectionChange('crypto-to-fiat')}
      >
        <Text style={[
          styles.toggleButtonText,
          direction === 'crypto-to-fiat' && styles.activeToggleButtonText
        ]}>
          Crypto → Fiat
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          direction === 'fiat-to-crypto' && styles.activeToggleButton
        ]}
        onPress={() => onDirectionChange('fiat-to-crypto')}
      >
        <Text style={[
          styles.toggleButtonText,
          direction === 'fiat-to-crypto' && styles.activeToggleButtonText
        ]}>
          Fiat → Crypto
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  directionToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: colors.lemon,
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
