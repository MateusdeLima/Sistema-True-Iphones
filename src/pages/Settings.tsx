import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

function Settings() {
  const { user, updateUserPreferences } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePreferencesUpdate = (
    preferences: {
      theme?: 'light' | 'dark';
      language?: 'pt-BR' | 'en';
      notificationPreferences?: {
        email: boolean;
        whatsapp: boolean;
        warrantyDays: number;
      };
    }
  ) => {
    if (!user || !user.preferences) return;
    
    try {
      setIsSubmitting(true);
      // Combine as preferências existentes com as novas
      const updatedPreferences = {
        theme: preferences.theme || user.preferences.theme,
        language: preferences.language || user.preferences.language,
        notificationPreferences: {
          ...user.preferences.notificationPreferences,
          ...preferences.notificationPreferences
        }
      };
      
      updateUserPreferences(user.id, updatedPreferences);
      toast.success('Preferências atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar preferências:', err);
      toast.error('Erro ao atualizar preferências');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se o usuário não estiver autenticado, não renderiza nada (isso não deve acontecer com rota protegida)
  if (!user || !user.preferences) {
    return <div className="p-6">Carregando preferências...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Preferências do Sistema</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handlePreferencesUpdate({
                  theme: 'light'
                })}
                className={`px-4 py-2 rounded ${
                  user.preferences.theme === 'light'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                Claro
              </button>
              <button
                onClick={() => handlePreferencesUpdate({
                  theme: 'dark'
                })}
                className={`px-4 py-2 rounded ${
                  user.preferences.theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                Escuro
              </button>
            </div>
          </div>

          {/* Seletor de Idioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Idioma</label>
            <select
              value={user.preferences?.language || 'pt-BR'}
              onChange={(e) =>
                handlePreferencesUpdate({
                  ...user.preferences,
                  language: e.target.value as 'pt-BR' | 'en',
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;