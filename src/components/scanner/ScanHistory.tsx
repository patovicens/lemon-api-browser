import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart, faHeartBroken, faTrash, faEdit, faTimes, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useScanner } from '../../contexts/ScannerContext';
import { ScannedWallet } from '../../types/crypto';
import { formatWalletAddress, getWalletTypeDisplayName, getWalletTypeColor } from '../../utils/walletUtils';
import { ThemeColors } from '../../theme';

const ScanHistory: React.FC = () => {
  const { colors } = useTheme();
  const { scannedWallets, toggleFavorite, removeWallet, updateWalletNotes } = useScanner();
  const navigation = useNavigation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const styles = createStyles(colors);

  const filteredWallets = showFavoritesOnly
    ? scannedWallets.filter(wallet => wallet.isFavorite)
    : scannedWallets;

  const handleEditNotes = (wallet: ScannedWallet) => {
    setEditingId(wallet.id);
    setEditNotes(wallet.notes || '');
  };

  const handleSaveNotes = () => {
    if (editingId) {
      updateWalletNotes(editingId, editNotes);
      setEditingId(null);
      setEditNotes('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes('');
  };

  const handleDeleteWallet = (wallet: ScannedWallet) => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete this ${getWalletTypeDisplayName(wallet.type)} wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeWallet(wallet.id) },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderWalletItem = ({ item }: { item: ScannedWallet }) => {
    const isEditing = editingId === item.id;
    const date = new Date(item.timestamp).toLocaleDateString();
    const time = new Date(item.timestamp).toLocaleTimeString();

    return (
      <View style={styles.walletItem}>
        <View style={styles.walletHeader}>
          <View style={styles.walletTypeContainer}>
            <View
              style={[
                styles.walletTypeBadge,
                { backgroundColor: getWalletTypeColor(item.type) },
              ]}
            >
              <Text style={styles.walletTypeText}>
                {getWalletTypeDisplayName(item.type)}
              </Text>
            </View>
            {item.isFavorite && (
              <FontAwesomeIcon icon={faHeart} size={16} color={colors.error} />
            )}
          </View>
          <Text style={styles.timestampText}>{date} {time}</Text>
        </View>

        <Text style={styles.addressText}>{formatWalletAddress(item.address)}</Text>

        {isEditing ? (
          <View style={styles.notesEditContainer}>
            <TextInput
              style={styles.notesEditInput}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Add notes..."
              placeholderTextColor={colors.themeTextTertiary}
              multiline
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleSaveNotes} style={styles.saveEditButton}>
                <FontAwesomeIcon icon={faCheck} size={16} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelEditButton}>
                <FontAwesomeIcon icon={faTimes} size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.notesContainer}>
            {item.notes ? (
              <Text style={styles.notesText}>{item.notes}</Text>
            ) : (
              <Text style={styles.noNotesText}>No notes</Text>
            )}
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            style={styles.actionButton}
          >
            <FontAwesomeIcon
              icon={item.isFavorite ? faHeartBroken : faHeart}
              size={16}
              color={item.isFavorite ? colors.error : colors.themeTextSecondary}
            />
            <Text
              style={[
                styles.actionButtonText,
                item.isFavorite && styles.favoriteActionText,
              ]}
            >
              {item.isFavorite ? 'Remove' : 'Favorite'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleEditNotes(item)}
            style={styles.actionButton}
          >
            <FontAwesomeIcon icon={faEdit} size={16} color={colors.info} />
            <Text style={styles.actionButtonText}>Edit Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeleteWallet(item)}
            style={styles.actionButton}
          >
            <FontAwesomeIcon icon={faTrash} size={16} color={colors.error} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={16} color={colors.themeText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan History</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>
          {showFavoritesOnly ? 'Favorite Wallets' : 'All Wallets'}
        </Text>
        <TouchableOpacity
          onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
          style={[
            styles.filterButton,
            showFavoritesOnly && styles.filterButtonActive,
          ]}
        >
          <FontAwesomeIcon
            icon={faHeart}
            size={18}
            color={showFavoritesOnly ? colors.themeBackground : colors.error}
          />
          <Text
            style={[
              styles.filterButtonText,
              showFavoritesOnly && styles.filterButtonTextActive,
            ]}
          >
            {showFavoritesOnly ? 'Show All' : 'Show Favorites'}
          </Text>
        </TouchableOpacity>
      </View>

      {filteredWallets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {showFavoritesOnly
              ? 'No favorite wallets yet'
              : 'No scanned wallets yet'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {showFavoritesOnly
              ? 'Scan some wallets and mark them as favorites'
              : 'Start scanning QR codes to see your history here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredWallets}
          renderItem={renderWalletItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    padding: 10,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
  },
  placeholder: {
    width: 60,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    borderRadius: 20,
    backgroundColor: colors.themeSurfaceLight,
    minWidth: 150,
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: colors.themeTextSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.themeBackground,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  walletItem: {
    backgroundColor: colors.themeSurface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 12,
    color: colors.themeTextTertiary,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.themeText,
    marginBottom: 12,
    padding: 8,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 6,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    fontStyle: 'italic',
  },
  noNotesText: {
    fontSize: 14,
    color: colors.themeTextTertiary,
    fontStyle: 'italic',
  },
  notesEditContainer: {
    marginBottom: 16,
  },
  notesEditInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: colors.themeText,
    backgroundColor: colors.themeSurfaceLight,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveEditButton: {
    padding: 8,
    backgroundColor: colors.success,
    borderRadius: 6,
  },
  cancelEditButton: {
    padding: 8,
    backgroundColor: colors.error,
    borderRadius: 6,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.themeSurfaceLight,
    flex: 1,
    justifyContent: 'center',
    opacity: 0.8,
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.themeTextSecondary,
  },
  favoriteActionText: {
    color: colors.error,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ScanHistory;
