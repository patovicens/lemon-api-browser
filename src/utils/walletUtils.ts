import { WalletType } from '../types/crypto';
import { colors } from '../theme/colors';

// Wallet address patterns for different cryptocurrencies
const WALLET_PATTERNS: Record<WalletType, RegExp> = {
  BTC: /^(bc1|[13])[a-km-zA-HJ-NP-Z1-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
  BCH: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  XRP: /^r[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  ADA: /^addr1[a-z0-9]{98}$/,
  DOT: /^1[a-km-zA-HJ-NP-Z1-9]{46}$/,
  LINK: /^0x[a-fA-F0-9]{40}$/, 
  UNKNOWN: /.*/, // Catch-all for unknown types
};

/**
 * Detects the type of cryptocurrency wallet from an address
 */
export const detectWalletType = (address: string): WalletType => {
  const cleanAddress = address.trim();
  
  for (const [type, pattern] of Object.entries(WALLET_PATTERNS)) {
    if (pattern.test(cleanAddress)) {
      return type as WalletType;
    }
  }
  
  return 'UNKNOWN';
};

/**
 * Validates if an address is a valid cryptocurrency wallet address
 */
export const isValidWalletAddress = (address: string): boolean => {
  const cleanAddress = address.trim();
  return cleanAddress.length > 0 && detectWalletType(cleanAddress) !== 'UNKNOWN';
};

/**
 * Formats wallet address for display (truncates middle part)
 */
export const formatWalletAddress = (address: string, maxLength: number = 20): string => {
  if (address.length <= maxLength) return address;
  
  const start = address.substring(0, Math.floor(maxLength / 2) - 2);
  const end = address.substring(address.length - Math.floor(maxLength / 2) + 2);
  
  return `${start}...${end}`;
};

/**
 * Gets the display name for wallet types
 */
export const getWalletTypeDisplayName = (type: WalletType): string => {
  const names: Record<WalletType, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    LTC: 'Litecoin',
    BCH: 'Bitcoin Cash',
    XRP: 'Ripple',
    ADA: 'Cardano',
    DOT: 'Polkadot',
    LINK: 'Chainlink',
    UNKNOWN: 'Unknown',
  };
  
  return names[type];
};

/**
 * Gets the color for wallet types (for UI purposes)
 */
export const getWalletTypeColor = (type: WalletType): string => {
  const colorMap: Record<WalletType, string> = {
    BTC: colors.walletBTC,
    ETH: colors.walletETH,
    LTC: colors.walletLTC,
    BCH: colors.walletBCH,
    XRP: colors.walletXRP,
    ADA: colors.walletADA,
    DOT: colors.walletDOT,
    LINK: colors.walletLINK,
    UNKNOWN: colors.walletUnknown,
  };
  
  return colorMap[type];
};
