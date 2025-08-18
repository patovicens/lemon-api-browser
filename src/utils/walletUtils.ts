import { WalletType } from '../types/crypto';
import { colors } from '../theme/colors';

// Wallet address patterns for different cryptocurrencies
const WALLET_PATTERNS: Record<WalletType, RegExp> = {
  // Bitcoin patterns - more specific first
  BTC: /^(bc1[a-zA-HJ-NP-Z0-9]{39}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  // Ethereum and ERC20 tokens (like LINK) share the same pattern
  ETH: /^0x[a-fA-F0-9]{40}$/,
  // Litecoin - Legacy (L), P2SH (M), and bech32 (ltc1) addresses
  LTC: /^(ltc1[a-zA-HJ-NP-Z0-9]{39}|[LM][a-km-zA-HJ-NP-Z1-9]{26,33})$/,
  // Bitcoin Cash uses different prefixes
  BCH: /^[qp][a-zA-Z0-9]{41}$/,
  // Ripple addresses
  XRP: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  // Cardano addresses
  ADA: /^(addr1|Ae2)[a-zA-Z0-9]{50,120}$/,
  // Polkadot addresses
  DOT: /^[1-9A-HJ-NP-Za-km-z]{47,48}$/,
  // LINK is an ERC20, uses same pattern as ETH
  LINK: /^0x[a-fA-F0-9]{40}$/,
  // Solana addresses are base58 encoded public keys
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  // TRON addresses start with T and are base58 encoded
  TRX: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  // Catch-all for unknown types
  UNKNOWN: /.*/,
};

/**
 * Detects the type of cryptocurrency wallet from an address
 */
export const detectWalletType = (address: string): WalletType => {
  const cleanAddress = address.trim();
  
  // Check in specific order to avoid pattern conflicts
  const checkOrder: WalletType[] = [
    'BTC',  // Check BTC first as it has specific prefixes
    'BCH',  // BCH next as it might overlap with BTC
    'LTC',  // LTC check before ETH as it can have similar patterns
    'ETH',  // ETH/LINK pattern
    'TRX',  // TRON has unique T prefix
    'SOL',  // Solana addresses
    'XRP',  // XRP has unique pattern
    'ADA',  // ADA has unique pattern
    'DOT',  // DOT has unique pattern
    'LINK', // Check LINK last as it shares pattern with ETH
  ];

  for (const type of checkOrder) {
    if (WALLET_PATTERNS[type].test(cleanAddress)) {
      return type;
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
    SOL: 'Solana',
    TRX: 'TRON',
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
    SOL: colors.walletSOL,
    TRX: colors.walletTRX,
    UNKNOWN: colors.walletUnknown,
  };
  
  return colorMap[type];
};
