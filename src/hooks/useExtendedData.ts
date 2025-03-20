import { useContext } from 'react';
import { ExtendedDataContext } from '../contexts/ExtendedDataContext';

export function useExtendedData() {
  const context = useContext(ExtendedDataContext);
  if (!context) {
    throw new Error('useExtendedData deve ser usado dentro de um ExtendedDataProvider');
  }
  return context;
} 