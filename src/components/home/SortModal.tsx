import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetModal, BottomSheetFlatList, BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';
import { SortOption } from '../../types/home';

interface SortModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSortChange: (sort: SortOption) => void;
  currentSort: SortOption;
  sortOptions: { key: string; label: string }[];
}



const SortModal: React.FC<SortModalProps> = ({
  isVisible,
  onClose,
  onSortChange,
  currentSort,
  sortOptions,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => {
    if (Platform.OS === 'ios') {
      return ['25%'];
    }
    return ['30%'];
  }, []);
  const initialIndex = 0;

  const handleSortSelect = useCallback((sort: { key: string; label: string }) => {
    onSortChange({ key: sort.key, label: sort.label, direction: currentSort.direction });
    onClose();
  }, [onSortChange, currentSort.direction, onClose]);

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

  const renderSortItem = useCallback(({ item }: { item: { key: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        currentSort.key === item.key && styles.optionItemSelected
      ]}
      onPress={() => handleSortSelect(item)}
    >
      <Text style={[
        styles.optionText,
        currentSort.key === item.key && styles.optionTextSelected
      ]}>
        {item.label}
      </Text>
      {currentSort.key === item.key && (
        <FontAwesomeIcon icon={faCheck} size={16} color={colors.lemon} />
      )}
    </TouchableOpacity>
  ), [currentSort.key, colors, handleSortSelect, styles]);

  
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
      backgroundStyle={{ backgroundColor: colors.themeSurface }}
      handleIndicatorStyle={{ backgroundColor: colors.themeBorder }}
    > 
      <BottomSheetFlatList
        data={sortOptions}
        renderItem={renderSortItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.modalBody}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheetModal>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    modalBody: {
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    closeButton: {
      position: 'absolute',
      right: 20,
      padding: 5,
    },
    closeButtonText: {
      fontSize: 20,
      color: colors.themeText,
    },
  });

export default SortModal;
