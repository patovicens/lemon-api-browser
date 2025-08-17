import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSort, faFilter, faChevronDown, faCheck, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  key: string;
  label: string;
  value: string | number | boolean | { min: number; max: number };
}

interface FilterSortBarProps {
  onSortChange: (sort: SortOption) => void;
  onFilterChange: (filters: FilterOption[]) => void;
  currentSort: SortOption;
  currentFilters: FilterOption[];
  isVisible?: boolean;
  onAnimationComplete?: () => void;
}

const SORT_OPTIONS = [
  { key: 'market_cap', label: 'Market Cap' },
  { key: 'volume', label: 'Volume' },
  { key: 'name', label: 'Name' },
];

const FILTER_OPTIONS = {
  priceChange: [
    { key: 'positive', label: 'Positive Change', value: 'positive' },
    { key: 'negative', label: 'Negative Change', value: 'negative' },
  ],
};

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
  
  const [tempFilters, setTempFilters] = useState<FilterOption[]>(currentFilters);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const expandAnimation = useRef(new Animated.Value(0)).current;

  // Update tempFilters when currentFilters changes
  useEffect(() => {
    setTempFilters(currentFilters);
    
    // Reset price inputs if no price range filter is active
    const priceRangeFilter = currentFilters.find(filter => filter.key === 'price_range_custom');
    if (!priceRangeFilter) {
      setMinPrice('');
      setMaxPrice('');
    } else if (typeof priceRangeFilter.value === 'object' && 'min' in priceRangeFilter.value && 'max' in priceRangeFilter.value) {
      const { min, max } = priceRangeFilter.value as { min: number; max: number };
      setMinPrice(min === 0 ? '' : min.toString());
      setMaxPrice(max === Infinity ? '' : max.toString());
    }
  }, [currentFilters]);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(expandAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(expandAnimation, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
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

  const handleFilterToggle = (filter: FilterOption) => {
    const exists = tempFilters.find(existingFilter => existingFilter.key === filter.key);
    if (exists) {
              setTempFilters(tempFilters.filter(existingFilter => existingFilter.key !== filter.key));
    } else {
      setTempFilters([...tempFilters, filter]);
    }
  };

  const handlePriceRangeApply = () => {
    console.log('🔍 Applying price range filter - min:', minPrice, 'max:', maxPrice);
    
    // Remove any existing price range filters
    const nonPriceRangeFilters = tempFilters.filter(filter => !filter.key.startsWith('price_range_'));
    
    if (minPrice || maxPrice) {
      const priceRangeFilter: FilterOption = {
        key: 'price_range_custom',
        label: `$${minPrice || '0'} - $${maxPrice || '∞'}`,
        value: { min: minPrice ? parseFloat(minPrice) : 0, max: maxPrice ? parseFloat(maxPrice) : Infinity }
      };
      console.log('🔍 Created price range filter:', priceRangeFilter);
      setTempFilters([...nonPriceRangeFilters, priceRangeFilter]);
    } else {
      setTempFilters(nonPriceRangeFilters);
    }
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setTempFilters([]);
    onFilterChange([]);
    setShowFilterModal(false);
  };

  const getActiveFiltersCount = () => currentFilters.length;

  return (
    <View>
      <Animated.View 
        style={[
          styles.container,
          {
            height: expandAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 52],
            }),
            opacity: expandAnimation.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 0.8, 1],
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
              scaleY: expandAnimation.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 0.98, 1],
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
          <Text style={styles.buttonText}>
            {currentSort.label || 'Sort'}
          </Text>
          <FontAwesomeIcon icon={faChevronDown} size={10} color={colors.themeTextSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.directionButton,
            currentSort.direction === 'asc' && styles.buttonActive
          ]}
          onPress={() => handleDirectionSelect('asc')}
        >
          <FontAwesomeIcon icon={faArrowUp} size={14} color={currentSort.direction === 'asc' ? colors.lemon : colors.themeTextSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.directionButton,
            currentSort.direction === 'desc' && styles.buttonActive
          ]}
          onPress={() => handleDirectionSelect('desc')}
        >
          <FontAwesomeIcon icon={faArrowDown} size={14} color={currentSort.direction === 'desc' ? colors.lemon : colors.themeTextSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, getActiveFiltersCount() > 0 && styles.buttonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <FontAwesomeIcon icon={faFilter} size={14} color={getActiveFiltersCount() > 0 ? colors.lemon : colors.themeTextSecondary} />
          <Text style={styles.buttonText}>
            {getActiveFiltersCount() > 0 ? getActiveFiltersCount() : 'Filter'}
          </Text>
        </TouchableOpacity>
      </Animated.View>


      {/* TODO: Use grohom bottom sheet and move to separate file */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {SORT_OPTIONS.map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.optionItem,
                    currentSort.key === sort.key && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    if (sort.key !== currentSort.key) {
                      onFilterChange([]);
                    }
                    onSortChange({ key: sort.key, label: sort.label, direction: currentSort.direction });
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    currentSort.key === sort.key && styles.optionTextSelected
                  ]}>
                    {sort.label}
                  </Text>
                  {currentSort.key === sort.key && (
                    <FontAwesomeIcon icon={faCheck} size={16} color={colors.lemon} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TODO: Use grohom bottom sheet and move to separate file */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Price Change</Text>
              {FILTER_OPTIONS.priceChange.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.optionItem,
                    tempFilters.find(existingFilter => existingFilter.key === filter.key) && styles.optionItemSelected
                  ]}
                  onPress={() => handleFilterToggle(filter)}
                >
                  <Text style={[
                    styles.optionText,
                    tempFilters.find(existingFilter => existingFilter.key === filter.key) && styles.optionTextSelected
                  ]}>
                    {filter.label}
                  </Text>
                  {tempFilters.find(existingFilter => existingFilter.key === filter.key) && (
                    <FontAwesomeIcon icon={faCheck} size={16} color={colors.lemon} />
                  )}
                </TouchableOpacity>
              ))}

              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                <View style={styles.priceInputsRow}>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Min Price ($)</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={minPrice}
                      onChangeText={setMinPrice}
                      placeholder="0"
                      keyboardType="numeric"
                      placeholderTextColor={colors.themeTextTertiary}
                    />
                  </View>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceInputLabel}>Max Price ($)</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      placeholder="∞"
                      keyboardType="numeric"
                      placeholderTextColor={colors.themeTextTertiary}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.applyPriceRangeButton}
                  onPress={handlePriceRangeApply}
                >
                  <Text style={styles.applyPriceRangeButtonText}>Apply Range</Text>
                </TouchableOpacity>
              </View>
              
              {/* Show active price range filter */}
              {tempFilters.find(existingFilter => existingFilter.key === 'price_range_custom') && (
                <View style={styles.activePriceRangeContainer}>
                  <Text style={styles.activePriceRangeText}>
                    {tempFilters.find(existingFilter => existingFilter.key === 'price_range_custom')?.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setTempFilters(tempFilters.filter(existingFilter => existingFilter.key !== 'price_range_custom'));
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  >
                    <Text style={styles.removePriceRangeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: colors.themeSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
    gap: 8,
    overflow: 'hidden', 
    minHeight: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.themeSurfaceLight,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    gap: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.opacityBlack,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.themeSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
  },
  closeButton: {
    fontSize: 20,
    color: colors.themeTextSecondary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginTop: 16,
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: colors.lemonLight,
  },
  optionText: {
    fontSize: 16,
    color: colors.themeText,
  },
  optionTextSelected: {
    color: colors.lemon,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.themeBorder,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.lemon,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: colors.themeBackground,
    fontWeight: '600',
  },
  priceRangeContainer: {
    marginBottom: 16,
  },
  priceInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceInputLabel: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    marginBottom: 4,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.themeBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.themeText,
    backgroundColor: colors.themeSurface,
  },
  applyPriceRangeButton: {
    backgroundColor: colors.lemon,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyPriceRangeButtonText: {
    fontSize: 16,
    color: colors.themeBackground,
    fontWeight: '600',
  },
  activePriceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lemonLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  activePriceRangeText: {
    fontSize: 14,
    color: colors.lemon,
    fontWeight: '600',
  },
  removePriceRangeText: {
    fontSize: 16,
    color: colors.lemon,
    fontWeight: '600',
  },
});

export default FilterSortBar;
