import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

import { ConversionErrorInfoProps } from '../../types/exchange';

const ConversionErrorInfo: React.FC<ConversionErrorInfoProps> = ({
  error,
  conversionError,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!error && !conversionError) {
    return null;
  }

  return (
    <View style={styles.errorInfo}>
      <View style={styles.errorContent}>
        <Text style={styles.errorText}>{error || conversionError}</Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  errorInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginLeft: 6,
    flex: 1,
    textAlign: 'center',
  },
});

export default ConversionErrorInfo;
