import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClock, faMobileAlt, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Camera, CameraType } from 'react-native-camera-kit';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { ThemeColors } from '../../theme';
import { detectWalletType } from '../../utils/walletUtils';

import { QRScannerProps } from '../../types/scanner';

import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScannerStackParamList, MainTabParamList } from '../../navigation/types';

type QRScannerNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ScannerStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.7;
const HORIZONTAL_OFFSET = (SCREEN_WIDTH - FRAME_SIZE) / 2;
const VERTICAL_OFFSET = (SCREEN_HEIGHT - FRAME_SIZE) / 2;

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult: _onScanResult, onShowHistory }) => {
  const navigation = useNavigation<QRScannerNavigationProp>();
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSimulator, setIsSimulator] = useState<boolean>(false);
  const styles = createStyles(colors);

  useEffect(() => {
    checkSimulator();
    checkCameraAvailability();
  }, []);

  // Handle camera setup and cleanup on screen focus/blur
  useFocusEffect(
    useCallback(() => {
      checkCameraPermission();
      setIsProcessing(false);

      return () => {
        // Cleanup when screen loses focus
        setIsProcessing(false);
        setHasPermission(null);
      };
    }, [])
  );

  const checkSimulator = () => {
    if (Platform.OS === 'ios') {
      const simulatorDetected = Platform.isPad || Platform.isTV;
      setIsSimulator(simulatorDetected);
    } else if (Platform.OS === 'android') {
      // Android Emulator detection - disabled for testing
      const emulatorDetected = false;
      setIsSimulator(emulatorDetected);
    }
  };


  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  const checkCameraAvailability = () => {

    if (Platform.OS === 'ios') {
      // iOS doesn't have a direct way to check camera availability
      // but we can check if we're on a device that should have a camera
      const hasCamera = !Platform.isPad && !Platform.isTV;
      if (!hasCamera) {
        setIsSimulator(true);
        return false;
      }
    }
    return true;
  };

  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs camera access to scan QR codes.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      // iOS: Check current permission state first, then request if needed
      try {
        const currentStatus = await check(PERMISSIONS.IOS.CAMERA);
        
        if (currentStatus === RESULTS.GRANTED) {
          setHasPermission(true);
        } else if (currentStatus === RESULTS.DENIED) {
          const result = await request(PERMISSIONS.IOS.CAMERA);
          
          if (result === RESULTS.GRANTED) {
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        } else if (currentStatus === RESULTS.BLOCKED) {
          setHasPermission(false);
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error('iOS: Error checking/requesting camera permission:', error);
        setHasPermission(false);
      }
    }
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
            onPress={checkCameraPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>
              Grant Permission
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openSettings}
            style={[styles.permissionButton, styles.settingsButton]}
          >
            <Text style={styles.settingsButtonText}>
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isSimulator) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBackToHome} 
            style={[styles.closeButton, { borderColor: colors.themeBorder }]}
          >
            <FontAwesomeIcon icon={faXmark} size={24} color={colors.themeText} />
          </TouchableOpacity>
        </View>

        <View style={styles.simulatorContainer}>
          <View style={styles.simulatorIcon}>
            <FontAwesomeIcon icon={faMobileAlt} size={80} color={colors.themeText} />
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
              <FontAwesomeIcon icon={faClock} size={16} color={colors.themeText} />
              <Text style={styles.featureText}>View scan history</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesomeIcon icon={faClock} size={16} color={colors.themeText} />
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
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackToHome} 
          style={[styles.closeButton, { borderColor: colors.themeBorder }]}
        >
          <FontAwesomeIcon icon={faXmark} size={24} color={colors.themeText} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onShowHistory} 
          style={[styles.historyButton, { borderColor: colors.themeBorder }]}
        >
          <FontAwesomeIcon icon={faClock} size={20} color={colors.themeText} />
        </TouchableOpacity>
      </View>

      {/* Camera Component */}
      <View style={styles.cameraContainer}>
        <View style={styles.scanContainer}>
          <Camera
            key={isProcessing ? 'processing' : 'ready'}
            style={styles.camera}
            cameraType={CameraType.Back}
            scanBarcode={true}
            showFrame={false}
            onReadCode={(event) => {
              // Prevent multiple rapid scans
              if (isProcessing) return;
              
              // Ensure we have a code value
              if (!event.nativeEvent.codeStringValue) return;

              setIsProcessing(true);
              
              const content = event.nativeEvent.codeStringValue;
              const walletType = detectWalletType(content);
              
              const walletResult = {
                address: content,
                type: walletType,
                timestamp: Date.now(),
                isFavorite: false,
                rawContent: content,
              };

              if (_onScanResult) {
                _onScanResult(walletResult);
                setTimeout(() => {
                  setIsProcessing(false);
                }, 500);
              }
            }}
            onError={(error) => {
              console.error('Camera error:', error);
              
              Alert.alert(
                'Camera Error',
                'Camera initialization failed. Please try again.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Retry', onPress: () => {
                    // Force re-render of camera component
                    setIsProcessing(!isProcessing);
                  }}
                ]
              );
            }}
          />
          
          {/* Custom Frame Corners */}
          <View style={styles.scanFrame}>
            {/* Top Left */}
            <View style={[styles.corner, styles.topLeft]}>
              <View style={styles.cornerHorizontal} />
              <View style={styles.cornerVertical} />
            </View>
            
            {/* Top Right */}
            <View style={[styles.corner, styles.topRight]}>
              <View style={styles.cornerHorizontal} />
              <View style={styles.cornerVertical} />
            </View>
            
            {/* Bottom Left */}
            <View style={[styles.corner, styles.bottomLeft]}>
              <View style={styles.cornerHorizontal} />
              <View style={styles.cornerVertical} />
            </View>
            
            {/* Bottom Right */}
            <View style={[styles.corner, styles.bottomRight]}>
              <View style={styles.cornerHorizontal} />
              <View style={styles.cornerVertical} />
            </View>
          </View>
        </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.themeSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.themeSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  scanContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  cornerHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: colors.lemon,
  },
  cornerVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: colors.lemon,
  },
  topLeft: {
    top: Platform.OS === 'ios' ? VERTICAL_OFFSET - 60 : VERTICAL_OFFSET,
    left: HORIZONTAL_OFFSET,
  },
  topRight: {
    top: Platform.OS === 'ios' ? VERTICAL_OFFSET - 60 : VERTICAL_OFFSET,
    right: HORIZONTAL_OFFSET,
    transform: [{ rotate: '90deg' }],
  },
  bottomLeft: {
    top: Platform.OS === 'ios' ? VERTICAL_OFFSET + FRAME_SIZE - 80 : VERTICAL_OFFSET + FRAME_SIZE - 20,
    left: HORIZONTAL_OFFSET,
    transform: [{ rotate: '-90deg' }],
  },
  bottomRight: {
    top: Platform.OS === 'ios' ? VERTICAL_OFFSET + FRAME_SIZE - 80 : VERTICAL_OFFSET + FRAME_SIZE - 20,
    right: HORIZONTAL_OFFSET,
    transform: [{ rotate: '180deg' }],
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
  secondaryButton: {
    backgroundColor: colors.themeSurface,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
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
  settingsButton: {
    backgroundColor: colors.themeSurface,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    marginTop: 10,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
  },
});

export default QRScanner;
