import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSort, faFilter, faChevronDown, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import SortModal from './SortModal';
import FilterModal from './FilterModal';

import {  FilterSortBarProps } from '../../types/home';

const SORT_OPTIONS = [
  { key: 'market_cap', label: 'Market Cap' },
  { key: 'volume', label: 'Volume' },
  { key: 'name', label: 'Name' },
];

const FilterSortBar: React.FC<FilterSortBarProps> = ({
  onSortChange,
  onFilterChange,
  currentSort,
  currentFilters,
  isVisible = true,
  onAnimationComplete,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const expandAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: 250,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(expandAnimation, {
        toValue: 0,
        duration: 200,
        easing: Easing.bezier(0.4, 0, 1, 1), 
        useNativeDriver: false,
      }).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isVisible, expandAnimation, onAnimationComplete]);

  const handleDirectionSelect = (direction: 'asc' | 'desc') => {
    onSortChange({ key: currentSort.key, label: currentSort.label, direction });
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.expandableContent,
          {
            height: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 52],
            }),
            opacity: expandAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 1],
            }),
            paddingTop: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            paddingBottom: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
            transform: [{
              scale: expandAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              })
            }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.sortFieldButton}
          onPress={() => setShowSortModal(true)}
        >
          <FontAwesomeIcon icon={faSort} size={14} color={colors.themeTextSecondary} />
          <Text style={styles.buttonText}>{currentSort.label}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={10} color={colors.themeTextSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.directionButton,
            currentSort.direction === 'asc' && styles.buttonActive
          ]}
          onPress={() => handleDirectionSelect('asc')}
        >
          <FontAwesomeIcon 
            icon={faArrowUp} 
            size={14} 
            color={currentSort.direction === 'asc' ? colors.lemon : colors.themeTextSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.directionButton,
            currentSort.direction === 'desc' && styles.buttonActive
          ]}
          onPress={() => handleDirectionSelect('desc')}
        >
          <FontAwesomeIcon 
            icon={faArrowDown} 
            size={14} 
            color={currentSort.direction === 'desc' ? colors.lemon : colors.themeTextSecondary} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            currentFilters.length > 0 && styles.buttonActive
          ]}
          onPress={() => setShowFilterModal(true)}
        >
          <FontAwesomeIcon icon={faFilter} size={14} color={currentFilters.length > 0 ? colors.lemon : colors.themeTextSecondary} />
          <Text style={[
            styles.buttonText,
            currentFilters.length > 0 && { color: colors.lemon }
          ]}>
            Filters {currentFilters.length > 0 ? `(${currentFilters.length})` : ''}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <SortModal
        isVisible={showSortModal}
        onClose={() => setShowSortModal(false)}
        onSortChange={onSortChange}
        currentSort={currentSort}
        sortOptions={SORT_OPTIONS}
      />

      <FilterModal
        isVisible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => onFilterChange(filters)}
        onReset={() => onFilterChange([])}
        currentFilters={currentFilters}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.themeSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
    overflow: 'hidden',
  },
  expandableContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
    alignItems: 'center',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.themeSurfaceLight,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    gap: 4,
  },
  sortFieldButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.themeSurfaceLight,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    gap: 4,
  },
  directionButton: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.themeSurfaceLight,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
  buttonActive: {
    backgroundColor: colors.lemonLight,
    borderColor: colors.lemon,
  },
  buttonText: {
    fontSize: 12,
    color: colors.themeTextSecondary,
    fontWeight: '500',
  },
});

export default FilterSortBar;
