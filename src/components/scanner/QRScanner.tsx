import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHistory, faQrcode, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';

import { ThemeColors } from '../../theme';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width, height) * 0.7;

import { QRScannerProps } from '../../types/scanner';

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult: _onScanResult, onShowHistory }) => {
  const { colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulator, setIsSimulator] = useState<boolean>(false);
  const styles = createStyles(colors);

  useEffect(() => {
    checkSimulator();
    checkCameraPermission();
  }, []);

  const checkSimulator = () => {
    // Check if running on iOS Simulator or Android Emulator
    if (Platform.OS === 'ios') {
      // iOS Simulator detection
      const simulatorDetected = Platform.isPad || Platform.isTV || __DEV__;
      setIsSimulator(simulatorDetected);
    } else if (Platform.OS === 'android') {
      // Android Emulator detection
      const emulatorDetected = __DEV__;
      setIsSimulator(emulatorDetected);
    }
  };

  const checkCameraPermission = async () => {
    try {
      // TODO: use react-native-permissions
      setHasPermission(true);
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
    }
  };

  const requestCameraPermission = () => {
    Alert.alert(
      'Camera Permission Required',
      'This app needs camera access to scan QR codes. Please grant camera permission in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: () => {} }, // TODO: open settings
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to scan QR codes.
          </Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isSimulator) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <TouchableOpacity onPress={onShowHistory} style={styles.historyButton}>
            <FontAwesomeIcon icon={faHistory} size={20} color={colors.themeText} />
          </TouchableOpacity>
        </View>

        {/* Simulator Message */}
        <View style={styles.simulatorContainer}>
          <View style={styles.simulatorIcon}>
            <FontAwesomeIcon icon={faMobileAlt} size={80} color={colors.lemon} />
          </View>
          
          <Text style={styles.simulatorTitle}>Physical Device Required</Text>
          
          <Text style={styles.simulatorText}>
            The QR scanner requires a physical device with a camera to function properly.
          </Text>
          
          <Text style={styles.simulatorSubtext}>
            iOS Simulator and Android Emulator cannot access the device camera.
          </Text>

          <View style={styles.simulatorFeatures}>
            <Text style={styles.featuresTitle}>What you can test:</Text>
            <View style={styles.featureItem}>
              <FontAwesomeIcon icon={faHistory} size={16} color={colors.lemon} />
              <Text style={styles.featureText}>View scan history</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesomeIcon icon={faQrcode} size={16} color={colors.lemon} />
              <Text style={styles.featureText}>Manage saved wallets</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={onShowHistory} 
            style={styles.viewHistoryButton}
          >
            <Text style={styles.viewHistoryButtonText}>View Scan History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <TouchableOpacity onPress={onShowHistory} style={styles.historyButton}>
          <FontAwesomeIcon icon={faHistory} size={20} color={colors.themeText} />
        </TouchableOpacity>
      </View>

      {/* Camera Placeholder for Physical Device */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <FontAwesomeIcon icon={faQrcode} size={80} color={colors.lemon} />
          <Text style={styles.cameraPlaceholderText}>Camera Ready</Text>
          <Text style={styles.cameraPlaceholderSubtext}>
            Camera component would be rendered here on physical device
          </Text>
        </View>
        
        {/* Scan Area Overlay */}
        <View style={styles.scanAreaOverlay}>
          <View style={styles.scanArea} />
          
          {/* Corner Indicators */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Position the QR code within the frame to scan
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <FontAwesomeIcon
            icon={faQrcode}
            size={24}
            color={colors.themeText}
          />
          <Text style={styles.controlButtonText}>
            Camera Controls
          </Text>
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
    backgroundColor: colors.themeBackground,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.themeText,
  },
  historyButton: {
    padding: 10,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanAreaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: colors.lemon,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.lemon,
    borderWidth: 3,
  },
  topLeft: {
    top: (height - SCAN_AREA_SIZE) / 2 - 10,
    left: (width - SCAN_AREA_SIZE) / 2 - 10,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: (height - SCAN_AREA_SIZE) / 2 - 10,
    right: (width - SCAN_AREA_SIZE) / 2 - 10,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: (height - SCAN_AREA_SIZE) / 2 - 10,
    left: (width - SCAN_AREA_SIZE) / 2 - 10,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: (height - SCAN_AREA_SIZE) / 2 - 10,
    right: (width - SCAN_AREA_SIZE) / 2 - 10,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 20,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: colors.themeText,
    textAlign: 'center',
    backgroundColor: colors.opacityBlack,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: colors.themeBackground,
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.themeSurface,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.themeText,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeText,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.lemon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeBackground,
  },
  simulatorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.themeBackground,
  },
  simulatorIcon: {
    marginBottom: 20,
  },
  simulatorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.themeText,
    marginBottom: 10,
    textAlign: 'center',
  },
  simulatorText: {
    fontSize: 16,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  simulatorSubtext: {
    fontSize: 14,
    color: colors.themeTextTertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  simulatorFeatures: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.themeText,
    marginBottom: 10,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.themeTextSecondary,
  },
  viewHistoryButton: {
    backgroundColor: colors.lemon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewHistoryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeBackground,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.themeSurface,
    borderRadius: 10,
    padding: 20,
  },
  cameraPlaceholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.themeText,
    marginTop: 15,
  },
  cameraPlaceholderSubtext: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default QRScanner;
