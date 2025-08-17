import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import QRScanner from '../components/scanner/QRScanner';
import { WalletScanResult } from '../types/crypto';

type ScannerStackParamList = {
  ScannerMain: undefined;
  ScanResult: { scanResult: WalletScanResult };
  ScanHistory: undefined;
};

type ScannerScreenNavigationProp = StackNavigationProp<ScannerStackParamList, 'ScannerMain'>;

const ScannerScreen: React.FC = () => {
  const navigation = useNavigation<ScannerScreenNavigationProp>();

  const handleScanResult = (result: WalletScanResult) => {
    navigation.navigate('ScanResult', { scanResult: result });
  };

  const handleShowHistory = () => {
    navigation.navigate('ScanHistory');
  };

  return (
    <QRScanner
      onScanResult={handleScanResult}
      onShowHistory={handleShowHistory}
    />
  );
};

export default ScannerScreen;
