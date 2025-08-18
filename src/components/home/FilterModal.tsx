import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import { FilterOption } from '../../types/home';

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOption[]) => void;
  onReset: () => void;
  currentFilters: FilterOption[];
}

const FILTER_OPTIONS = {
  priceChange: [
    { key: 'positive', label: 'Positive Change', value: 'positive' },
    { key: 'negative', label: 'Negative Change', value: 'negative' },
  ],
};

const FilterModal: React.FC<FilterModalProps> = ({
  isVisible,
  onClose,
  onApply,
  onReset,
  currentFilters,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (Platform.OS === 'ios') {
      return ['65%'];
    }
    return ['75%'];
  }, []);
  const initialIndex = 0;

  const [tempFilters, setTempFilters] = useState<FilterOption[]>(currentFilters);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

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

  const handleFilterToggle = useCallback((filter: FilterOption) => {
    const exists = tempFilters.find(existingFilter => existingFilter.key === filter.key);
    if (exists) {
      setTempFilters(tempFilters.filter(existingFilter => existingFilter.key !== filter.key));
    } else {
      setTempFilters([...tempFilters, filter]);
    }
  }, [tempFilters]);

  const handlePriceRangeApply = useCallback(() => {
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    
    if (min >= 0 && (max === Infinity || max > min)) {
      const priceRangeFilter: FilterOption = {
        key: 'price_range_custom',
        label: `$${min} - ${max === Infinity ? '∞' : `$${max}`}`,
        value: { min, max },
      };
      
      // Remove existing price range filter if any
      const filtersWithoutPriceRange = tempFilters.filter(filter => filter.key !== 'price_range_custom');
      setTempFilters([...filtersWithoutPriceRange, priceRangeFilter]);
    }
  }, [minPrice, maxPrice, tempFilters]);

  const resetFilters = useCallback(() => {
    setTempFilters([]);
    setMinPrice('');
    setMaxPrice('');
    onReset();
  }, [onReset]);

  const applyFilters = useCallback(() => {
    onApply(tempFilters);
    onClose();
  }, [onApply, tempFilters, onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={initialIndex}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose
      enableDynamicSizing={false}
      backgroundStyle={{ backgroundColor: colors.themeSurface }}
      handleIndicatorStyle={{ backgroundColor: colors.themeBorder }}
    >
      <BottomSheetScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
        <Text style={styles.filterSectionTitle}>24h Variation</Text>
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
      </BottomSheetScrollView>
      
      <View style={styles.modalFooter}>
        <TouchableOpacity 
          style={[
            styles.resetButton,
            tempFilters.length === 0 && styles.buttonDisabled
          ]} 
          onPress={resetFilters}
          disabled={tempFilters.length === 0}
        >
          <Text style={[
            styles.resetButtonText,
            tempFilters.length === 0 && styles.buttonTextDisabled
          ]}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.applyButton,
            tempFilters.length === 0 && styles.buttonDisabled
          ]} 
          onPress={applyFilters}
          disabled={tempFilters.length === 0}
        >
          <Text style={[
            styles.applyButtonText,
            tempFilters.length === 0 && styles.buttonTextDisabled
          ]}>Apply</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 12,
    marginTop: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.themeSurfaceLight,
    marginBottom: 8,
  },
  optionItemSelected: {
    backgroundColor: colors.lemonLight,
    borderWidth: 1,
    borderColor: colors.lemon,
  },
  optionText: {
    fontSize: 14,
    color: colors.themeText,
  },
  optionTextSelected: {
    color: colors.themeText,
    fontWeight: '500',
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
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: colors.themeBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.themeText,
    backgroundColor: colors.themeSurfaceLight,
  },
  applyPriceRangeButton: {
    backgroundColor: colors.lemon,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyPriceRangeButtonText: {
    color: colors.themeBackground,
    fontSize: 14,
    fontWeight: '600',
  },
  activePriceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lemonLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lemon,
  },
  activePriceRangeText: {
    color: colors.themeText,
    fontSize: 14,
    fontWeight: '500',
  },
  removePriceRangeText: {
    color: colors.lemon,
    fontSize: 16,
    fontWeight: '600',
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.themeBorder,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    backgroundColor: colors.themeSurfaceLight,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.themeText,
    fontSize: 14,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.lemon,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.themeBackground,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.themeSurfaceLight,
    borderColor: colors.themeBorder,
  },
  buttonTextDisabled: {
    color: colors.themeTextSecondary,
  },
});

export default FilterModal;
