import { WalletScanResult } from './crypto';

export interface QRScannerProps {
  onScanResult: (result: WalletScanResult) => void;
  onShowHistory: () => void;
}
