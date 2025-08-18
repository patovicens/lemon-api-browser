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
import { faHeart, faHeartBroken, faSave, faCopy, faArrowLeft, faClock } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useScanner } from '../../contexts/ScannerContext';
import { WalletScanResult } from '../../types/crypto';
import { formatWalletAddress, getWalletTypeDisplayName } from '../../utils/walletUtils';
import { ThemeColors } from '../../theme';
import Clipboard from '@react-native-clipboard/clipboard';

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
    const contentToCopy = scanResult.type === 'UNKNOWN' 
      ? (scanResult.rawContent || scanResult.address)
      : scanResult.address;
    Clipboard.setString(contentToCopy);
    Alert.alert('Copied', 'Content copied to clipboard');
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const confirmDiscard = (action: () => void) => {
    Alert.alert(
      'Discard Changes?',
      'Any unsaved changes will be lost. Do you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: action }
      ]
    );
  };

  const handleBack = () => {
    confirmDiscard(() => navigation.goBack());
  };

  const handleScanAgain = () => {
    confirmDiscard(() => navigation.navigate('ScannerMain' as never));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color={colors.themeText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ScanHistory' as never)} //TODO: remove this as never
          style={[styles.historyButton, { borderColor: colors.themeBorder }]}
        >
          <FontAwesomeIcon icon={faClock} size={20} color={colors.themeText} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.resultCard}>
          <View style={styles.walletTypeContainer}>
            <Text style={styles.walletTypeText}>
              {getWalletTypeDisplayName(scanResult.type)}
            </Text>
          </View>

          {scanResult.type === 'UNKNOWN' ? (
            <>
              <Text style={styles.addressLabel}>Scanned Content:</Text>
              <Text style={styles.addressText}>{scanResult.rawContent || scanResult.address}</Text>
              
              <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                <FontAwesomeIcon icon={faCopy} size={16} color={colors.themeTextSecondary} />
                <Text style={styles.copyButtonText}>Copy Content</Text>
              </TouchableOpacity>

              <Text style={styles.unknownNote}>
                This QR code doesn't match any known wallet address format, but you can still save it.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.addressLabel}>Wallet Address:</Text>
              <Text style={styles.addressText}>{formatWalletAddress(scanResult.address)}</Text>
              
              <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                <FontAwesomeIcon icon={faCopy} size={16} color={colors.themeTextSecondary} />
                <Text style={styles.copyButtonText}>Copy Address</Text>
              </TouchableOpacity>
            </>
          )}

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
                styles.favoriteToggle,
                isFavorite && styles.favoriteToggleActive,
              ]}
            >
              <FontAwesomeIcon
                icon={isFavorite ? faHeart : faHeartBroken}
                size={20}
                color={isFavorite ? colors.lemon : colors.themeTextSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <FontAwesomeIcon icon={faSave} size={20} color={colors.themeBackground} />
              <Text style={styles.saveButtonText}>
                Save {isFavorite ? 'to Favorites' : 'Wallet'}
              </Text>
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.themeSurfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: colors.themeSurface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.themeBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletTypeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTypeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.themeText,
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
  unknownNote: {
    fontSize: 14,
    color: colors.themeTextTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  favoriteToggle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.themeSurfaceLight,
  },
  favoriteToggleActive: {
    borderColor: colors.lemon,
    backgroundColor: colors.themeSurfaceLight,
  },
  saveButton: {
    flex: 1,
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
