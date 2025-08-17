import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart, faHeartBroken, faSave, faCopy, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useScanner } from '../../contexts/ScannerContext';
import { WalletScanResult } from '../../types/crypto';
import { formatWalletAddress, getWalletTypeDisplayName, getWalletTypeColor } from '../../utils/walletUtils';
import { ThemeColors } from '../../theme';

type ScannerStackParamList = {
  ScannerMain: undefined;
  ScanResult: { scanResult: WalletScanResult };
  ScanHistory: undefined;
};

type ScanResultRouteProp = RouteProp<ScannerStackParamList, 'ScanResult'>;

const ScanResultSummary: React.FC = () => {
  const { colors } = useTheme();
  const { addScannedWallet } = useScanner();
  const navigation = useNavigation();
  const route = useRoute<ScanResultRouteProp>();
  const { scanResult } = route.params;
  
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(scanResult.isFavorite);
  const styles = createStyles(colors);

  const handleSave = () => {
    const resultToSave: WalletScanResult = {
      ...scanResult,
      isFavorite,
    };

    addScannedWallet(resultToSave);
    Alert.alert('Success', 'Wallet address saved successfully!');
    navigation.goBack();
  };

  const handleCopyAddress = () => {
    // TODO: use clipboard api
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleScanAgain = () => {
    navigation.navigate('ScannerMain' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color={colors.themeText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.resultCard}>
          <View style={styles.walletTypeContainer}>
            <View
              style={[
                styles.walletTypeBadge,
                { backgroundColor: getWalletTypeColor(scanResult.type) },
              ]}
            >
              <Text style={styles.walletTypeText}>
                {getWalletTypeDisplayName(scanResult.type)}
              </Text>
            </View>
          </View>

          <Text style={styles.addressLabel}>Wallet Address:</Text>
          <Text style={styles.addressText}>{formatWalletAddress(scanResult.address)}</Text>
          
          <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
            <FontAwesomeIcon icon={faCopy} size={16} color={colors.themeTextSecondary} />
            <Text style={styles.copyButtonText}>Copy Address</Text>
          </TouchableOpacity>

          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes (optional):</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this wallet..."
              placeholderTextColor={colors.themeTextTertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={toggleFavorite}
              style={[
                styles.favoriteButton,
                isFavorite && styles.favoriteButtonActive,
              ]}
            >
              <FontAwesomeIcon
                icon={isFavorite ? faHeart : faHeartBroken}
                size={20}
                color={isFavorite ? colors.error : colors.themeTextSecondary}
              />
              <Text
                style={[
                  styles.favoriteButtonText,
                  isFavorite && styles.favoriteButtonTextActive,
                ]}
              >
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <FontAwesomeIcon icon={faSave} size={20} color={colors.themeBackground} />
              <Text style={styles.saveButtonText}>Save Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={handleScanAgain} style={styles.scanAgainButton}>
          <Text style={styles.scanAgainText}>Scan Another QR Code</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.themeSurface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletTypeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.themeTextSecondary,
    marginBottom: 16,
    textAlign: 'center',
    padding: 12,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.themeTextSecondary,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.themeText,
    backgroundColor: colors.themeSurfaceLight,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    gap: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.themeSurfaceLight,
    opacity: 0.8,
  },
  favoriteButtonActive: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
    opacity: 1,
  },
  favoriteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.themeTextSecondary,
  },
  favoriteButtonTextActive: {
    color: colors.error,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: colors.lemon,
    borderRadius: 8,
  },
  saveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeBackground,
  },
  scanAgainButton: {
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.themeSurface,
  },
  scanAgainText: {
    fontSize: 16,
    color: colors.themeText,
    fontWeight: '500',
  },
});

export default ScanResultSummary;
