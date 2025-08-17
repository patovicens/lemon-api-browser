import { WalletScanResult } from '../types/crypto';

export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Exchange: undefined;
  Scanner: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
};

export type ExchangeStackParamList = {
  ExchangeMain: undefined;
};

export type ScannerStackParamList = {
  ScannerMain: undefined;
  ScanResult: { scanResult: WalletScanResult };
  ScanHistory: undefined;
};
