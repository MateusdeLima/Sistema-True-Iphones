import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { AuthError, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'seller';
  preferences?: {
    theme: 'light' | 'dark';
    language: 'pt-BR' | 'en';
    notificationPreferences: {
      email: boolean;
      whatsapp: boolean;
      warrantyDays: number;
    };
  };
}

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  updateUserPreferences: (userId: string, preferences: User['preferences']) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Usuário administrador para teste
const ADMIN_USER: User = {
  id: '1',
  email: 'admin@trueiphones.com',
  name: 'Administrador',
  role: 'admin',
  preferences: {
    theme: 'light',
    language: 'pt-BR',
    notificationPreferences: {
      email: true,
      whatsapp: true,
      warrantyDays: 30
    }
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [users] = useState<User[]>([ADMIN_USER]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthStateChange = useCallback(async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      const currentUser = users.find(u => u.email === supabaseUser.email);
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.warn('Usuário autenticado não encontrado na lista de usuários:', supabaseUser.email);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [users]);

  useEffect(() => {
    // Verifica a sessão atual ao montar o componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session?.user ?? null);
    });

    // Inscreve-se para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthStateChange(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verifica se as credenciais correspondem ao usuário de teste
      if (email === 'admin@trueiphones.com' && password === 'admin123') {
        // Login manual com usuário de teste
        setUser(ADMIN_USER);
        toast.success('Login realizado com sucesso!');
        return;
      }
      
      // Se não for o usuário de teste, tenta autenticar com Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      toast.success('Login realizado com sucesso!');
    } catch (err) {
      const authError = err as AuthError;
      console.error('Erro ao fazer login:', authError);
      setError(authError.message);
      toast.error('Erro ao fazer login. Verifique suas credenciais.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tente fazer logout no Supabase, mas não falhe se não estiver conectado
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Erro ao fazer logout no Supabase:', e);
      }
      
      // Sempre limpe o estado do usuário local
      setUser(null);
      toast.success('Logout realizado com sucesso!');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao fazer logout:', error);
      setError(error.message);
      toast.error('Erro ao fazer logout.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao atualizar perfil:', error);
      setError(error.message);
      toast.error('Erro ao atualizar perfil.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateUserPreferences = useCallback(async (userId: string, preferences: User['preferences']) => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.id !== userId) {
        throw new Error('Usuário não encontrado');
      }

      const updatedUser = { ...user, preferences };
      setUser(updatedUser);
      toast.success('Preferências atualizadas com sucesso!');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao atualizar preferências:', error);
      setError(error.message);
      toast.error('Erro ao atualizar preferências.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        users, 
        loading, 
        error, 
        login, 
        logout, 
        updateUser,
        updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}