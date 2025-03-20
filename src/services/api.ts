import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';
import type { Cliente, Servico, Peca } from '../types/database.types';

type Tables = Database['public']['Tables'];
type ClienteInsert = Tables['clientes']['Insert'];
type ClienteUpdate = Tables['clientes']['Update'];
type ServicoInsert = Tables['servicos']['Insert'];
type ServicoUpdate = Tables['servicos']['Update'];
type PecaInsert = Tables['pecas']['Insert'];
type PecaUpdate = Tables['pecas']['Update'];

// Função de tratamento de erro genérica
const handleDatabaseError = (error: Error | unknown, operacao: string) => {
  console.error(`Erro durante ${operacao}:`, error);
  if (error instanceof Error) {
    throw new Error(`Falha ao ${operacao}: ${error.message}`);
  }
  throw new Error(`Falha ao ${operacao}: Erro desconhecido`);
};

export const clientesApi = {
  async listar(): Promise<Cliente[]> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'listar clientes');
      return [];
    }
  },

  async criar(cliente: ClienteInsert): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado após criar cliente');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'criar cliente');
      throw error;
    }
  },

  async atualizar(id: string, cliente: ClienteUpdate): Promise<Cliente> {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Cliente não encontrado');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar cliente');
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'deletar cliente');
      throw error;
    }
  }
};

export const servicosApi = {
  async listar(): Promise<Servico[]> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'listar serviços');
      return [];
    }
  },

  async criar(servico: ServicoInsert): Promise<Servico> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([servico])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado após criar serviço');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'criar serviço');
      throw error;
    }
  },

  async atualizar(id: string, servico: ServicoUpdate): Promise<Servico> {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update(servico)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Serviço não encontrado');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar serviço');
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'deletar serviço');
      throw error;
    }
  }
};

export const pecasApi = {
  async listar(): Promise<Peca[]> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'listar peças');
      return [];
    }
  },

  async criar(peca: PecaInsert): Promise<Peca> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .insert([peca])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nenhum dado retornado após criar peça');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'criar peça');
      throw error;
    }
  },

  async atualizar(id: string, peca: PecaUpdate): Promise<Peca> {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .update(peca)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Peça não encontrada');
      return data;
    } catch (error) {
      handleDatabaseError(error, 'atualizar peça');
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pecas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'deletar peça');
      throw error;
    }
  }
};
