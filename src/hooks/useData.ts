import { useContext } from 'react';
import { ExtendedDataContext } from '../contexts/ExtendedDataContext';

export function useData() {
  const context = useContext(ExtendedDataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um ExtendedDataProvider');
  }
  return context;
}
