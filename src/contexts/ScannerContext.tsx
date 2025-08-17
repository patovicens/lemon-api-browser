import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannedWallet, WalletScanResult } from '../types/crypto';

interface ScannerContextType {
  scannedWallets: ScannedWallet[];
  addScannedWallet: (result: WalletScanResult) => void;
  toggleFavorite: (id: string) => void;
  removeWallet: (id: string) => void;
  updateWalletNotes: (id: string, notes: string) => void;
  getFavorites: () => ScannedWallet[];
  clearHistory: () => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

const STORAGE_KEY = 'scanned_wallets';

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
};

interface ScannerProviderProps {
  children: ReactNode;
}

export const ScannerProvider: React.FC<ScannerProviderProps> = ({ children }) => {
  const [scannedWallets, setScannedWallets] = useState<ScannedWallet[]>([]);

  useEffect(() => {
    loadScannedWallets();
  }, []);

  const loadScannedWallets = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const wallets = JSON.parse(stored) as ScannedWallet[];
        setScannedWallets(wallets);
      }
    } catch (error) {
      console.error('Error loading scanned wallets:', error);
    }
  };

  const saveScannedWallets = async (wallets: ScannedWallet[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
    } catch (error) {
      console.error('Error saving scanned wallets:', error);
    }
  };

  const addScannedWallet = (result: WalletScanResult) => {
    const newWallet: ScannedWallet = {
      id: Date.now().toString(),
      address: result.address,
      type: result.type,
      timestamp: result.timestamp,
      isFavorite: result.isFavorite,
      notes: '',
    };

    const updatedWallets = [newWallet, ...scannedWallets];
    setScannedWallets(updatedWallets);
    saveScannedWallets(updatedWallets);
  };

  const toggleFavorite = (id: string) => {
    const updatedWallets = scannedWallets.map(wallet =>
      wallet.id === id ? { ...wallet, isFavorite: !wallet.isFavorite } : wallet
    );
    setScannedWallets(updatedWallets);
    saveScannedWallets(updatedWallets);
  };

  const removeWallet = (id: string) => {
    const updatedWallets = scannedWallets.filter(wallet => wallet.id !== id);
    setScannedWallets(updatedWallets);
    saveScannedWallets(updatedWallets);
  };

  const updateWalletNotes = (id: string, notes: string) => {
    const updatedWallets = scannedWallets.map(wallet =>
      wallet.id === id ? { ...wallet, notes } : wallet
    );
    setScannedWallets(updatedWallets);
    saveScannedWallets(updatedWallets);
  };

  const getFavorites = () => {
    return scannedWallets.filter(wallet => wallet.isFavorite);
  };

  const clearHistory = () => {
    setScannedWallets([]);
    saveScannedWallets([]);
  };

  const value: ScannerContextType = {
    scannedWallets,
    addScannedWallet,
    toggleFavorite,
    removeWallet,
    updateWalletNotes,
    getFavorites,
    clearHistory,
  };

  return (
    <ScannerContext.Provider value={value}>
      {children}
    </ScannerContext.Provider>
  );
};
